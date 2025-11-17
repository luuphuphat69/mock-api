interface IResource {
  _id: string
  projectId: string
  name: string
  schemaFields: ISchemaField[]
  records: []
}
