let all_classes =   `   SELECT distinct ?class
WHERE {
    ?class a  owl:Class
} 
order by ?class
`;

let subclass_of_all_classes = `
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
`;

let 