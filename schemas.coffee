schemas = {}

schemas.DataCache = new Schema {
  created: type: Date, required: true
  expires: type: Date, required: true
  is_stale: type: Boolean, default: false
  slug: type: String, required: true
  parameters: type: String, default: ""
  data: type: Schema.Types.Mixed, default: []
}
