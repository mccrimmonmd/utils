// basic search on 'date' field
db.getCollection('slingmetrics.CMW')
  .find({date: '09/14/2021'})

// find objects updated within a certain range
db.getCollection('cyclone')
  .find({updatedAt: {
    $gte: new Date('2020-05-14'),
    $lt: new Date('2020-05-15')
  }})
  .sort({validTo: 1})

// find objects with requests > 0; sort by creation date (descending)
db.getCollection('slingmetrics.CMW')
  .find({'endpoints.totalRequests': {$gt: 0}})
  .sort({createdAt: -1})

// different way of doing above (not sorted)
db.getCollection('slingmetrics.CMW')
  .aggregate([{$match: {'endpoints.totalRequests': {$gt: 0}}}])

// search using regular expression literal
db.getCollection('locations')
  .find({name: /Meridian/})

// search for records with non-null values
db.getCollection('interfaces')
  .find({circuitId: {$ne: null}})

// search for records with non-empty values (NOT the same as above!)
db.getCollection('cyclone.certs')
  .find({requestor: {$exists: true}})

// search for records with null *or* missing values (really!)
db.getCollection('cyclone.certs')
  .find({requestor: null})

// search with logic conditions; count number of results
db.getCollection('logViewer.log')
  .find({level: {$ne: 'error'}, appName: {$ne: 'slingmetrics'}})
  .count()

// combine multiple conditions (should be implicit, but sometimes isn't?)
db.getCollection('userSession')
  .find({ $and: [
    {role: {$ne: 10}},
    {role: {$exists: true}}
  ]})

// middleware query for loading paged data
models.Cert.find({ active: true })
  .skip(offset)
  .limit(limit)
  .sort({ [field]: order })
  .lean()

// adding new fields to search results
db.getCollection('cyclone.certs')
  .aggregate([{$addFields: {
    digiOrderNumber: "$digicertInfo.orderNumber",
    commonName: {$arrayElemAt: ["$sans.name", 0]}
  }}])

// searching nested objects
db.getCollection('cyclone.certs')
  .find({"sans.name": "www.blackbegonias.dish.com"})

// searching for multiple values 
db.getCollection('interfaces').find({_id: 
  { $in: [
    ObjectId("608a678ae44894ccba332602"),
    ObjectId("608a678ae44894ccba332615"),
    ObjectId("608a678ae44894ccba33262e"),
    ObjectId("608a678ae44894ccba332639"),
    ObjectId("608a678ae44894ccba33263e"),
    ObjectId("608a678ae44894ccba332648"),
    ObjectId("608a678ae44894ccba33264b"),
    ObjectId("608a678ae44894ccba332654"),
    ObjectId("608a678be44894ccba33265b")
  ]}
})

// list of all distinct values for a given field
db.getCollection('cyclone.certs')
  .distinct('status')

// search for objects with duplicate fields ($date, in this case)
db.getCollection('slingmetrics.CMW')
  .aggregate([
    {"$group" : { 
        "_id": "$date", 
        "count": { "$sum": 1 }, 
        "ID": { $push: "$_id" }
      }
    },
    {"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } }
  ])
//  .toArray().reduce((ids, doc) => ids.concat(doc.ID), [])
