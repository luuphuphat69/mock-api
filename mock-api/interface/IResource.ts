interface IResource {
  _id: string
  projectId: string
  name: string
  endpoint: string
  schemaFields: ISchemaField[]
  records: []
}
