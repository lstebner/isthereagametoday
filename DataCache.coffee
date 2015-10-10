###

class DataCache

  This class is intended to provide an easy way to store data that will be retrieved frequently.

  The schema allows data to be an array containing anything, but it is reccommended to keep the contents
  to a minimum otherwise it will bog down the query and defeat the purpose of caching. It is also 
  recommended to break very large cache's into smaller lists. How you define these breaks will be
  specific to your situation.

  DataCache's are intended to be created with an expiration date, but it can be as far out as you want. 
  If you want to expire them manually or use manual refreshes this value can just be set far out so no
  automated action is ever taken on these records.

  DataCache's are stored/fetched based on the "slug", sometimes also called the
  "key". This value can be repeated over multiple entries and should be in the 
  case of chunks. You would differentiate the chunks by using the "params"
  property.

  Params is meant to be a string which represents the unique configuration for
  this DataCache. You may not need to use them at all, but if you end up with
  a lot of cache, you will find them handy. A simple example is paginated results
  in which each entry may be key'd "latest_posts" but with params "page:1" etc.
  When setting params you can use an object or simply pass the desired string.

  Schema:
    created: type: Date, required: true
    expires: type: Date, required: true
    is_stale: type: Boolean, default: false
    slug: type: String, required: true
    parameters: type: String, default: ""
    data: type: Schema.Types.Mixed, default: []

###

class DataCache
  constructor: (@key="", @data=[], params="") ->
    @set_params @params

  set_data: (@data) ->

  set_params: (params) ->
    if typeof(params) != "string"
      compact = []
      for key, val of params
        compact.push "#{key}:#{val}"

      @params = compact.join "_"
    else
      @params = params

  expires: ->
    1000*60*60*24 #24hours

  store: (@data=@data) ->
    @remove_existing =>
      store = new models.DataCache
        created: (new Date).getTime()
        expires: (new Date).getTime() + @expires()
        slug: @key
        data: @data

      store.save (err) =>
        if err
          console.log "error creating DataCache '#{@key}': #{err}"
        else
          console.log "DataCache stored '#{@key}' #{@data.length} items"

  fetch: (params, fn) ->
    find = 
      slug: @key
      parameters: params

    query = models.DataCache.findOne find, (err, doc) =>
      if err
        console.log "DataCache fetch error", err

      fn? if err || !doc then false else doc.data

  remove_existing: (fn) ->
    models.DataCache.find { slug: @key }, (err, docs) =>
      if !err && docs
        console.log "DataCache removing #{docs.length} entries for #{@key}"
        for doc in docs
          doc.remove(->)

      fn?()

  refresh: -> 1

class DataCacheFetcher
  @get: (slug, fn) ->
    models.DataCache.findOne { slug: slug }, (err, doc) =>
      fn?(if err then false else doc.data)


