function startvaluelist(data,load,sortname,descending){

    listarray = data;
    const list = document.getElementById("valuelist");
    list.replaceChildren();

    const elementLibrary = document.getElementById("libraryelements");
    const nodeElement = elementLibrary.querySelector('.customerrow');

    document.getElementById("valucustomcounter").textContent = `${data.length} stk.`;
    
    data.forEach((company, index) => {
        const companyElement = nodeElement.cloneNode(true);
        
    // Legg til klassen "second" på annenhver element
    if (index % 2 !== 0) {
        companyElement.classList.add("second");
    }



        list.appendChild(companyElement);

        const name = companyElement.querySelector(".customname");
        name.textContent = company.customer;

        const value = companyElement.querySelector(".customvalue");
        value.textContent = company.value;


        const cut = companyElement.querySelector(".customcut");
        cut.textContent = company.cutvalue;

        const kickback = companyElement.querySelector(".cutsomkickback");
        kickback.textContent.kickbackvalue;
    });

    /*
    sortnameproperty = sortname;
   if(load){
   listarray = [];
   }
   listarray = data;
   let newitembutton = false;
   let placenewitembutton = "topp";
   
   let tabelid = "tbly9xd4ho0Z9Mvlv";
   let viewColums = ["customer","value","cutvalue","kickbackvalue",];
   let saveColums = [0,0,0,0];
   let labledColums = ["Kunde","Handel","Besparelse","Kickback"];
   let justifyColums = ["start","end","end","end"];
   let typeColums = ["text","Kr","Kr","Kr"];
   let typeEditelement = ["text","text","text",,"text"];
   let cellClass = ["cellitem","cellitem","cellitem","cellitem"];
   //let headerColums = Object.keys(data[0]);
   let spaceColums = "1fr ".repeat(viewColums.length).trim();
   
   
    //sorterer som standard etter første kollonne
    var returnobject = sortarrayrows(sortname,descending,listarray);
     
     
   let property= {
   rowclick:false,
   idmarker:"customer",
   newitembutton:newitembutton,
   placenewitembutton:placenewitembutton,
   saveColums:saveColums,
   tableid:tabelid,
   typeEditelement:typeEditelement,
   viewColums:viewColums,
   labledColums:labledColums,
   spaceColums:spaceColums,
   justifyColums:justifyColums,
   typeColums:typeColums,
   idflagg:"airtable",
   classrow:"row",
   classHeaderrow:"headerrow",
   cellClass:cellClass,
   sortname:returnobject.sortname,
   descending:returnobject.descending
   };

   
   const list = document.getElementById("valuelist");
   rowGenerator(returnobject.array,list,property);
*/

}
