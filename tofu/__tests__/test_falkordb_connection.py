import os
from falkordb import FalkorDB


def test_falkordb_connection():
    """Test the connection to FalkorDB"""

    host = os.environ.get("FALKORDB_HOST")
    port = os.environ.get("FALKORDB_PORT")

    db = FalkorDB(host, port)
    assert db is not None

    graph = db.select_graph("test")

    res = graph.query(
        """
        RETURN 1
    """
    )
    
    assert res.result_set[0][0] == 1
