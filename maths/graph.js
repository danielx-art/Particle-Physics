const createGraph = function(){

    let vertices = [];
    let edges = [];
    let faces = [];

    /* EDGES */
    const edge = function(v1, v2, directed=false, weight=1){
        const self = {
            v1,
            v2,
            directed,
            weight,
            //face1,
            //face2,
        };
        return self;
    };

    /* VERTICES */
    const vertex = function(obj) {

        const self = {
            value: obj,
            edgeList: []
        };

        self.isConnected = function(vertex2){
            for(let i=0; i<edgeList.length; i++){
                if(self.edgeList(i).v1 === vertex2 || self.edgeList(i).v2 === vertex2){
                    return edgeList(i);
                }
            }
            return false;
        }
        
        self.connect = function(vertex2, directed = false){
            if(self.isConnected(vertex2) == false){
                let newEdge = edge(self, vertex2, directed);
                edges.push(newEdge);
                self.edgeList.push(newEdge);
                vertex2.edgeList.push(newEdge);
            }
        }

        return self;
    };

    /* -----------
    -----GRAPH----
    ------------*/

    const graph = {
        vertices,
        edges,
        faces,
        /*get an adjacency matrix with each value representing the connection between vertex i and vertex j,
        negative if the edge is directly in reverse*/
        get adjacencyMatrix() {

            let matrix = [];

            for(let i = 0; i<vertices.length; i++){
                let adjList = [];
                for(let j=0; j<vertices.length; j++){
                    let possibleEdge = vertices(i).isConnected(vertices(j));
                    if(possibleEdge != false){
                        let entry = possibleEdge.weight;
                        if(possibleEdge.directed && possibleEdge.v2 == vertices(i)){
                            entry *= -1;
                        }
                        adjList.push(entry);
                    } else {
                        adjList.push(0);
                    }
                }
                matrix.push(adjList);           
            }
            return matrix;
        }
    };

    //METHODS
    graph.addVertex = (obj) => vertices.push(obj);

    graph.addEdge = function(v1, v2, directed = false){
        //if on of these or both are new vertices, then add the one or both to vertices
        let index1 = vertices.indexOf(v1);
        if(index1 <= -1){
            vertices.push(v1);
        }
        let index2 = vertices.indexOf(v2);
        if(index2 <=-1){
            vertices.push(v2);
        }
        //test if they are already connected
        if(v1.isConnected(v2) == false){
            let newEdge = edge(v1, v2, directed);
            edges.push(newEdge);
            v1.edgeList.push(newEdge);
            v2.edgeList.push(newEdge);
        }
    }

    return graph 
}