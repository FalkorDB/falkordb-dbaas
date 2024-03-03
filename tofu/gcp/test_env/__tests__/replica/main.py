from falkordb import FalkorDB
from kubernetes import client, config
from kubernetes.stream import stream
import subprocess
import logging
import time
import random
from google.cloud import storage

config.load_kube_config()
k8s_api = client.CoreV1Api()


def test_connect(hostname, port, password):
    logging.debug(f"Connecting to FalkorDB at {hostname}:{port}")

    assert hostname is not None
    assert port is not None and port.isdigit()

    try:
        db = FalkorDB(hostname, port, password)

        graph = db.select_graph("test")

        res = graph.query("RETURN 1")

        assert res.result_set[0][0] == 1

    except Exception as e:
        logging.error(e)
        assert False


def test_read_write_delete(hostname, port, password):
    try:
        db = FalkorDB(hostname, port, password)

        graph = db.select_graph("test")

        res = graph.query("CREATE (n:Person {name: 'John Doe'}) RETURN n")

        assert res.result_set[0][0].properties["name"] == "John Doe"

        res = graph.query("MATCH (n:Person) RETURN n")

        assert res.result_set[0][0].properties["name"] == "John Doe"

        graph.query("MATCH (n:Person) DELETE n")

        res = graph.query("MATCH (n:Person) RETURN n")

        assert len(res.result_set) == 0

    except Exception as e:
        logging.error(e)
        assert False


def test_read_write_delete_replica(hostname, port, password, namespace):
    try:

        db = FalkorDB(hostname, port, password)

        graph = db.select_graph("test")

        res = graph.query("CREATE (n:Person {name: 'John Doe'}) RETURN n")

        assert res.result_set[0][0].properties["name"] == "John Doe"

        # Get slave by label
        slaves = k8s_api.list_namespaced_pod(
            namespace="{}".format(namespace),
            label_selector="cloud.falkordb.io/role=slave",
        )

        assert len(slaves.items) == 1, "There should be one slave"

        slave_name = slaves.items[0].metadata.name

        # Execute query on slave
        resp = stream(
            k8s_api.connect_get_namespaced_pod_exec,
            slave_name,
            namespace,
            container="redis",
            command=[
                "/bin/sh",
                "-c",
                f"redis-cli -p {port} -a {password} --no-auth-warning GRAPH.RO_QUERY test 'MATCH (n:Person) RETURN n'",
            ],
            stderr=True,
            stdin=False,
            stdout=True,
            tty=False,
        )

        assert "John Doe" in resp

        graph.query("MATCH (n:Person) DELETE n")

        # Execute query on slave
        resp2 = stream(
            k8s_api.connect_get_namespaced_pod_exec,
            slave_name,
            namespace,
            container="redis",
            command=[
                "/bin/sh",
                "-c",
                f"redis-cli -p {port} -a {password} --no-auth-warning GRAPH.RO_QUERY test 'MATCH (n:Person) RETURN n'",
            ],
            stderr=True,
            stdin=False,
            stdout=True,
            tty=False,
        )

        assert "John Doe" not in resp2

    except Exception as e:
        logging.error(e)
        assert False


def test_create_backup(hostname, port, password, namespace, backup_bucket):
    # Add data to the database
    db = FalkorDB(hostname, port, password)
    graph = db.select_graph("backup_test")

    clone_folder = f"./tmp/iceandfire-{random.randint(0, 1000000)}"

    logging.debug(f"Cloning iceandfire dataset to {clone_folder}")
    subprocess.run(
        [
            "git",
            "clone",
            "https://github.com/redis-developer/redis-datasets",
            clone_folder,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=True,
    )
    base_dir = f"{clone_folder}/redisgraph/datasets/iceandfire/data"

    # Load data
    logging.debug(f"Loading data from {base_dir}")
    subprocess.run(
        [
            "falkordb-bulk-insert",
            "backup_test",
            "-u",
            f"redis://:{password}@{hostname}:{port}",
            "-n",
            "character.csv",
            "-n",
            "house.csv",
            "-n",
            "book.csv",
            "-n",
            "writer.csv",
            "-r",
            "wrote.csv",
            "-r",
            "belongs.csv",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=True,
        cwd=base_dir,
    )

    # Create backup
    _trigger_backup(namespace, True)

    # Delete graph
    graph.delete()

    # Check backup size
    backup = _get_last_backup_from_tenant(backup_bucket, namespace)
    assert backup is not None

    print("Backup:", backup.name)


def _trigger_backup(namespace, wait_for_completion):
    logging.debug(f"Triggering backup for tenant {namespace}")
    job_name = "falkordb-backup-" + str(random.randint(0, 1000000))
    cron_job_name = "falkordb-backup"

    batch_v1 = client.BatchV1Api()

    cron_job = batch_v1.read_namespaced_cron_job(cron_job_name, namespace)

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.models.V1ObjectMeta(
            name=job_name,
            # This annotation is added by kubectl, probably best to add it ourselves as well
            annotations={"cronjob.kubernetes.io/instantiate": "manual"},
        ),
        spec=cron_job.spec.job_template.spec,
    )

    batch_v1.create_namespaced_job(namespace, job)

    if wait_for_completion:
        logging.debug(f"Waiting for backup job {job_name} to complete")
        # Wait for job to complete
        while True:
            job_status = batch_v1.read_namespaced_job_status(job_name, namespace)
            if job_status.status.succeeded is not None:
                break
            logging.debug("Job not yet completed, waiting 5 second")
            time.sleep(5)


def _get_last_backup_from_tenant(backup_bucket, namespace):
    logging.debug(f"Retrieving last backup from tenant {namespace}")

    # Retrieve backup from Google Cloud Storage
    storage_client = storage.Client()

    bucket = storage_client.get_bucket(backup_bucket)

    blobs = bucket.list_blobs(prefix=namespace + "/")

    # Order blobs by name
    blobs = sorted(blobs, key=lambda x: x.name, reverse=True)

    # Return the first blob
    return blobs[0]
