const server = require('./server');

const ds = server.dataSources.db;
const tables = [
  'user', 'AccessToken', 'ACL', 'RoleMapping', 'Role', 'Category', 'SubCategory', 'Field', 'FieldValue',
  'Advertisement', 'City', 'Report', 'advertisementReport', 'Follow', 'Bookmark', 'Notification'
];
ds.automigrate(tables, error => {
  if (error)
    throw error;
  console.log(`Tables: ${tables.join(',')} created in ${ds.adapter.name}`);
  ds.disconnect();

});
