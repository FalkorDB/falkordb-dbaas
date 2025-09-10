import yup from 'yup';

export const ClusterSchema = yup.object({
  name: yup.string().required(),
  server: yup.string().required(),
});

export type Cluster = yup.InferType<typeof ClusterSchema>;

export const SilenceSchema = yup.object({
  id: yup.string().required(),
  matchers: yup.array().of(
    yup.object({
      name: yup.string().required(),
      value: yup.string().required(),
      matchType: yup.string().oneOf(['=', '!=', '=~', '!~']).required(),
    })
  ).required(),
});

export type Silence = yup.InferType<typeof SilenceSchema>;

export const AlertmanagerSilenceSchema = yup.object({
  id: yup.string().required(),
  matchers: yup.array().of(
    yup.object({
      name: yup.string().required(),
      value: yup.string().required(),
      isRegex: yup.boolean().required(),
      isEqual: yup.boolean().required(),
    })
  ).required(),
  startsAt: yup.string().required(),
  endsAt: yup.string().required(),
  createdBy: yup.string().required(),
  comment: yup.string().required(),
  status: yup.object({
    state: yup.string().oneOf(['active', 'pending', 'expired']).required(),
  }).required(),
});

export type AlertmanagerSilence = yup.InferType<typeof AlertmanagerSilenceSchema>;