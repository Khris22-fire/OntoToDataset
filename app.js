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
        `   SELECT distinct ?class
            WHERE {
                ?class a  owl:Class
            } 
            order by ?class
        `,
        { transform: 'toJSON' }
    )
    .then((result) => {
        const stream = fs.createWriteStream("subclass_triplets.csv");
        result.records.map(element => {
            // =============================================
            graphDBEndpoint
            .query(
                `
                    SELECT ?subject ?predicate ?object
                    WHERE  
                    {
                        VALUES ?object { <${element.class}> }
                        VALUES ?predicate { rdfs:subClassOf }
                        ?subject ?predicate ?object .
                        FILTER NOT EXISTS { 	 
                            ?otherSub rdfs:subClassOf ?object. 
                            ?subject rdfs:subClassOf ?otherSub .
                            FILTER (?otherSub != ?subject)
                        }
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
                    // stream.write(element.join(",") + "\r\n"); 
                    // for (let i of element) {
                    //     values = i.split(",") 
                    //     console.log(i)
                    //     stream.write(values.join(",") + "\r\n"); 
                    // }
                });
                

                
            }).catch((err) => {
                console.log(err);
            });
            // ======================================== 
        });
        // stream.end();
        console.log("Done!");
    })
    .catch((err) => {
        console.log(err);
    });
