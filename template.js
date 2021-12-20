
const { MongoClient } = require('mongodb');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    const uri = "mongodb+srv://admin:yCMZQP3dJcoLawsf@cluster0.30cuf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    
    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();
        await createSelectedDate(client, {date:"14/23/2021"})

        // Make the appropriate DB calls
 
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}
 
main().catch(console.error);

// Add functions that make DB calls here

async function listDatabases(client){
   const dbs = await client.db().admin().listDatabases();
   console.log(dbs);
   dbs.databases.forEach(element => {
       console.log(element.name)
   });
   return dbs
}

async function listDatabases(client){
    const dbs = await client.db().admin().listDatabases();
    console.log(dbs);
    dbs.databases.forEach(element => {
        console.log(element.name)
    });
 }

async function createSelectedDate(client, newDate){
   const result = await client.db("bookingSchedule").collection("dates").insertOne(newDate);

    console.log("New listing created with the following id : " + result.insertedId)
}

async function findSchedulebyDate(client,dateListed){

    const result = await client.db("bookingSchedule").collection("dates").findOne({date:dateListed})
    if(result){
        console.log(`Found date listed ${dateListed}`);
        console.log(result);

    }

}
async function deleteSchedulebyDate(client,dateListed){

    const result = await client.db("bookingSchedule").collection("dates").deleteOne({date:dateListed})
    if(result){
        console.log(`Found date and deleted listing ${dateListed}`);
        console.log(result);

    }

}
async function sortDates(client){
    const dbs = await listDatabases(client);
}

