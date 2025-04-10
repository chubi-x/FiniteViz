I built FiniteViz, a Web-Based Finite Element 3D Mesh Generator/Viewer, for my Msc Advanced Computer Science dissertation. FiniteViz is a microservices-based web application that efficiently sends and receives mesh data to and from C++ computation environment through a flask REST API and visualises said data on the client using Three.js.

FiniteViz is able to:

*  Generate multiple Finite Element meshes scalably and
effectively,
*  Accurately visualise 3D mesh results received from the server.
*  Horizontally scale based on user load and requirements

FiniteViz was ultimately built to provide an example of a cost-effective
and efficient finite element mesh generation tool which could enable students and
smaller engineering teams to run their computations without having to purchase
proprietary software licenses. My supervisor provided me with proprietary C++ mesh generation code, which I refactored and integrated into the architecture described below. Before integration, a user would have needed to
directly modify the source code to generate meshes for different geometries.

## Architecture

The system has four major components: A Client module, representing the browser User Interface responsible for visualising mesh data and sending
and receiving HTTP requests to a backend, a Computation module built with C++
that generates finite element meshes, the Server module that transfers client mesh data and results to and from the computation
module, and a Data module to store in-flight data shared between the server and
computation modules. 

![image](https://github.com/user-attachments/assets/21f3bf09-fb90-4e11-bed3-112d6271d055)
![image](https://github.com/user-attachments/assets/5917ed76-c76e-488b-b94c-73ea10b99ec1)

### How it Works

The client would send a payload to the server which contains a representation of a base mesh, including x,y,z coordinates, number of elemements, and how to split the elements, and would received a response 
containing a split mesh. 
### Example Payload
![image](https://github.com/user-attachments/assets/966d809a-8715-445d-98c5-7ebb55b1f923)

![image](https://github.com/user-attachments/assets/155fe733-fe87-427f-b95e-ebcf6b1ff2d4)
![image](https://github.com/user-attachments/assets/2a42e21f-a7f8-467a-b849-78fff2955168)

#### Actual UI
![image](https://github.com/user-attachments/assets/c649ffd4-1b21-45ad-bc0f-1a9a98ab8576)
![image](https://github.com/user-attachments/assets/e106dd2f-a27c-48b4-81be-d7ea5efcb00c)




