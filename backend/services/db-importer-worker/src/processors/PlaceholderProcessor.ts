import { Processor } from "bullmq"
import * as Yup from 'yup'

const schema = Yup.object();

const processor: Processor = async (job, token) => {
  return {
    success: true
  }
}

export default {
  name: 'placeholder',
  processor,
  schema,
}