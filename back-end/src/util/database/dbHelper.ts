import { MongoClient } from "mongodb";

const url = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@${ process.env.DB_URL }/${ process.env.DB_NAME }?retryWrites=true&w=majority`;

const client = new MongoClient(url/*, { useNewUrlParser: true, useUnifiedTopology: true }*/);

export default client.connect();
