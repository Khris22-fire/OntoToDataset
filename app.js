const { EnapsoGraphDBClient } = require('@innotrade/enapso-graphdb-client');
var fs = require('fs');
var stringify = require('csv-stringify');


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
        `   
        SELECT ?subject ?predicate ?object
        WHERE {
            ?subject rdfs:subClassOf <http://yowyob.org/service_onto.owl#service_family_0> .
            FILTER NOT EXISTS {
                ?sub rdfs:subClassOf ?subject FILTER(?sub != ?subject && ?sub != owl:Nothing ) 
            }
        } 
        `,
        { transform: 'toJSON' }
    )
    .then((result) => {
        const stream = fs.createWriteStream("leaf_classes_individuals.csv");
        result.records.map(element => {
            // =============================================
            graphDBEndpoint
            .query(
                `
                SELECT ?subject ?l ?p ?o
                WHERE {
                    VALUES ?o { <${element.subject}> }
                    ?subject rdf:type ?o.
                    ?subject <http://yowyob.org/service_onto.owl#has_label>    ?l.
                    values ?p { 'is_instance_of' }
                }
                `,
                { transform: 'toCSV' }
            )
            .then((result) => {
                let data = result.records;
                // console.log(data);
                data.forEach(element => {
                    console.log(typeof(element));
                    if(element != null){
                        values = element.split(",") 
                        stream.write(values.join(",") + "\r\n");
                    }
                }); 
            }).catch((err) => {
                console.log(err);
            });
            // ======================================== 

        });
        console.log("Done!");
        // console.log(result.records.length);
    })
    .catch((err) => {
        console.log(err);
    });
