const { EnapsoGraphDBClient } = require('@innotrade/enapso-graphdb-client');


// connection data to the running GraphDB instance
const GRAPHDB_BASE_URL = 'http://localhost:7200',
    GRAPHDB_REPOSITORY = 'Master2_lab',
    GRAPHDB_USERNAME = 'admin',
    GRAPHDB_PASSWORD = '',
    GRAPHDB_CONTEXT_TEST = 'http://ont.enapso.com/repo';


const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        prefix: 'yowyobonto', 
        iri: 'http://yowyob.org/service_onto.owl'
    }
];


let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES,
    transform: 'toCSV'
});

graphDBEndpoint
    .query(
        `   SELECT distinct ?class
            WHERE {
                ?class a  owl:Class
            } 
            order by ?class
            limit 10
        `,
        { transform: 'toJSON' }
    )
    .then((result) => {
        console.log(
            'Read the classes name:\n' + JSON.stringify(result, null, 2)
        );
    })
    .catch((err) => {
        console.log(err);
    });
