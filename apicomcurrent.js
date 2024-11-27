
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

function rawdatacleaner(data){
    var array = [];
        for (var i = 0;i<data.data.length;i++){
          array.push(data.data[i].fields);
        }
    return array;
}
//
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
    apireturn({success: true, data: data, id: id});
    }

}

async function POSTairtable(baseId,tableId,body,id){
    let token = MemberStack.getToken();
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&token=${token}`, {
       method: "POST",
       body:body,
       headers: {
       'Content-Type': 'application/json'
        }
       });
       let data = await response.json();
       apireturn (data,id);
}
    
async function DELETEairtable(baseId,tableId,itemId,id){
    let token = MemberStack.getToken();
    
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}`, {
          method: "DELETE"
        });
        let data = await response.json();
        apireturn (data,id);
}

async function PATCHairtable(baseId,tableId,itemId,body,id){
    // fra memberstack
    let token = MemberStack.getToken();
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}`, {
          method: "PATCH",
          body:body,
            headers: {
             'Content-Type': 'application/json'
            }
        });
        let data = await response.json();
        apireturn (data,id);
}
    
async function GETairtable(baseId,tableId,itemId,id){
        
        let token = MemberStack.getToken();
        let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}`);
       
        if (!response.ok) {
          throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
          }else {
          let data = await response.json();
          apireturn({success: true, data: data, id: id});
          }
        
}


function apireturn(response){
  if(response.success){
   ruteresponse(response.data,response.id);
  }else{
      console.log(response);
  }
}