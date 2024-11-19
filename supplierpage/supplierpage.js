
function getconnections(supplierid){
   let body = airtablebodylistAND({supplierid:supplierid});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"respondconnections");
}
 


function respondconnections(data){

    var cleandata = rawdatacleaner(data);

    startConnectionList(cleandata);


}


function startConnectionList(data) {
    const list = document.getElementById("listholderconnections");
    if (!list) {
        console.error("List holder element not found");
        return;
    }

    list.replaceChildren(); // Clear the list container

    const elementLibrary = document.getElementById("elementconnectionholder");
    if (!elementLibrary) {
        console.error("Element library not found");
        return;
    }

    const nodeElement = elementLibrary.querySelector('.rowelementnode');
    if (!nodeElement) {
        console.error("Template element not found");
        return;
    }

    data.forEach((connections, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Add class for alternating row styles
        if (index % 2 === 1) {
            rowElement.classList.add("pair");
        }

        // Populate the row with data
        rowElement.querySelector(".date").textContent = connections.lastmodified || "Ingen dato";
        rowElement.querySelector(".company").textContent = connections.companyname || "";
        rowElement.querySelector(".person").textContent = connections.companybrukernavn || "";
        rowElement.querySelector(".status").textContent = "aktiv";

        // Append the populated row to the list
        list.appendChild(rowElement);
    });
}













async function Getlistairtable(baseId,tableId,body,id){
    let token = MemberStack.getToken();
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/search?baseId=${baseId}&tableId=${tableId}&token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body
    });

    if (!response.ok) {
    throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
    }else {
    let data = await response.json();
    apireturnA({success: true, data: data, id: id});
    }

}





 

function createAirtableANDFormula(obj) {
    const conditions = Object.keys(obj).map(key => {
      const value = typeof obj[key] === 'string' ? `'${obj[key]}'` : obj[key];
      return `{${key}} = ${value}`;
    });
    return `AND(${conditions.join(', ')})`;
}

function airtablebodylistAND(obj){
    //Føringer etter dato
    let formula = createAirtableANDFormula(obj);
      let body = JSON.stringify({
              "formula":formula ,
              "pageSize": 50,
              "offset": 0
            });
      return body;
}



//ruting
function apireturnA(response){
    if(response.success){
     ruteresponse(response.data,response.id);
    }else{
        console.log(response);
    }
}



function ruteresponse(data,id){
  if(id == "respondconnections"){
    respondconnections(data);
  }
}





