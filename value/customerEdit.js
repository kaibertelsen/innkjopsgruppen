function placeEditorWrapperBack() {
    // Finn elementet med ID "editornewwrapper"
    const editorWrapper = document.getElementById("editornewwrapper");
    // Finn elementet med ID "listparrentholder"
    const orginalPlaceParent = document.getElementById("listparrentholder");

    // Sjekk om begge elementene eksisterer
    if (editorWrapper && orginalPlaceParent) {
        // Legg editorWrapper som et barn av orginalPlaceParent
        orginalPlaceParent.appendChild(editorWrapper);
        console.log("editorWrapper er plassert tilbake i orginalPlaceParent.");
    } else {
        if (!editorWrapper) {
            console.error("Elementet med ID 'editornewwrapper' ble ikke funnet.");
        }
        if (!orginalPlaceParent) {
            console.error("Elementet med ID 'listparrentholder' ble ikke funnet.");
        }
    }
}


const searchInputCs = document.getElementById("searchSupplierCompanysettings");
const dropdownCs = document.getElementById("dropdownCompanysettings");

const cutInput = document.getElementById("cutvalueInput");
cutInput.style.display = "none";

const selector = document.getElementById("groupCutcompanySelector");
selector.style.display = "none";

const saveCompanySettings = document.getElementById("saveCompanySettings");
saveCompanySettings.style.display = "none";

searchInputCs.addEventListener("input", function () {
    const searchTerm = searchInputCs.value.toLowerCase().trim();
    dropdownCs.innerHTML = ""; // Tøm tidligere treff

    if (searchTerm.length === 0) {
        dropdownCs.style.display = "none";
        return;
    }

    const matches = supplierlistbuffer.filter(supplier => {
        const name = (supplier.name || "").toLowerCase();
        const altName = (supplier.leverandornavn || "").toLowerCase();
        return name.includes(searchTerm) || altName.includes(searchTerm);
    });

    if (matches.length === 0) {
        dropdownCs.style.display = "none";
        return;
    }

    matches.forEach(supplier => {
        const item = document.createElement("div");
        item.classList.add("dropdown-item");
        item.textContent = supplier.name || supplier.leverandornavn;
        item.addEventListener("click", () => {
            searchInputCs.value = supplier.name || supplier.leverandornavn;
            dropdownCs.innerHTML = "";
            dropdownCs.style.display = "none";
            companySupplierSearch(supplier);
        });
        dropdownCs.appendChild(item);
    });

    dropdownCs.style.display = "block";
});


function companySupplierSearch(supplier) {
    //Sjekke om denne leverandøren har en standard rabatt
    if (supplier.defaultcut) {
        //sett input number til default rabatt
        const cutInput = document.getElementById("cutvalueInput");
        cutInput.value = supplier.defaultcut * 100 + "%";
        cutInput.style.display = "block";

        //gjøre selector
            const selector = document.getElementById("groupCutcompanySelector");
            selector.style.display = "block";
            //
            const saveCompanySettings = document.getElementById("saveCompanySettings");
            saveCompanySettings.style.display = "inline-block";

        //sjekke om leverandøren har volumrabetter
        if(!supplier.quantity){
            //har ikke mengderabatter
            const selector = document.getElementById("groupCutcompanySelector");
            selector.value = 1;
            selector.disabled = true;
        }else{
            //har mengderabatter
            const selector = document.getElementById("groupCutcompanySelector");
            selector.disabled = false;
        
        }
    console.log(supplier);
    }
}

const cutInputCp = document.getElementById("cutvalueInput");

cutInputCp.addEventListener("input", function () {
    let rawValue = this.value;

    // Tillat bare tall og ett desimaltegn (punktum eller komma)
    rawValue = rawValue.replace(/[^0-9.,]/g, "");

    // Hvis både punktum og komma finnes, fjern den ene
    if ((rawValue.match(/[.,]/g) || []).length > 1) {
        rawValue = rawValue.slice(0, -1); // fjern siste tegn
    }

    // Normaliser til punktum som desimaltegn
    rawValue = rawValue.replace(",", ".");

    // Hvis tomt, resett og avslutt
    if (rawValue === "") {
        this.value = "";
        return;
    }

    // Sett på riktig enhet
    const selector = document.getElementById("groupCutcompanySelector");
    const selectedValue = selector.value;
    let displayValue = rawValue;

    switch (selectedValue) {
        case "1":
            displayValue += "%";
            break;
        case "2":
            displayValue += "øre/l";
            break;
        case "3":
            displayValue += "kr/m³";
            break;
        default:
            console.error("Ugyldig valg");
    }

    this.value = displayValue;
});

const groupSettingSelect = document.getElementById("groupCutcompanySelector");

groupSettingSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    const selectedText = this.options[this.selectedIndex].text;

    console.log("Valgt verdi:", selectedValue);
    console.log("Valgt tekst:", selectedText);

    // Din funksjon basert på valget
    handleGroupSelection(selectedValue);
});

function handleGroupSelection(value) {
    switch (value) {
        case "1":
            console.log("Vis felt for prosentbesparelse");
            cutInputCp.value = "%";
            break;
        case "2":
            console.log("Vis felt for besparelse per liter");
            cutInputCp.value = "øre/l";
            break;
        case "3":
            console.log("Vis felt for besparelse per m³");
            cutInputCp.value = "kr/m³";
            break;
        default:
            console.log("Ugyldig valg");
    }
}

document.getElementById("saveCompanySettings").addEventListener("click", function () {
    const cutValue = cutInputCp.value;
    const supplierName = searchInputCs.value;
    const supplier = supplierlistbuffer.find(supplier => supplier.name === supplierName);
    const cutValueNumber = parseFloat(cutValue.replace(/[^\d.]/g, ""));
    const cutValueText = cutValue.replace(/\d/g, "");
    const cutValueFinal = cutValueNumber;


    const saveBody = {
            "company": [SelectedCompanyInFirstTab.airtable],
            "supplier": [supplier.airtable],
            "cut": cutValueFinal,
            "mode": groupSettingSelect.value,
            "user": [userairtableid]
    };

    //lager på server for selskapet
    POSTairtable("app1WzN1IxEnVu3m0","tbljS13MOpiiyCWPJ",JSON.stringify(saveBody),"respondCompanyCutSettings");
    
    //Lukk dropdown
    dropdownCs.innerHTML = "";
    dropdownCs.style.display = "none";
    cutInputCp.value = "";
    cutInputCp.style.display = "none";
    selector.style.display = "none";
    saveCompanySettings.style.display = "none";
});

function respondCompanyCutSettings(data){
    let datajson = JSON.parse(data.fields.json);
    SelectedCompanyInFirstTab.cutsettings.push(datajson);
    listcompanycutsettings(SelectedCompanyInFirstTab.cutsettings);
}

function addnewline(type,buttonid){
    reseteditwrapperinput();
    showhideeditwraper(type);
    const element = document.getElementById("editornewwrapper");
    element.style.display = "block";
    var listid;
    if(type == "handel"){
        listid = "listcopyholder";
    }else if(type == "bistand"){
        listid = "listholderbistand";
    }else if(type == "analyse"){
        listid = "listholderanalyse";
    }
    const list= document.getElementById(listid);
    list.appendChild(element);
    //document.getElementById(buttonid).style.display = "none";
}

function editLine(id,elementid,tracking){
        
        const element = document.getElementById("editornewwrapper");
        
        if(element.dataset?.hideobject){
            if(document.getElementById(element.dataset.hideobject)){
            //synligjør tidligere skjult element
            document.getElementById(element.dataset.hideobject).style.display = "grid";
            }
        }
        
        var object = findObjectProperty("airtable",id,companydatalines);
        loadEditwrapper(object);
        
        
        if(tracking == "handel"){
          //handelsoppsett  
       
        }
        
        const referanseelement = document.getElementById(elementid);
        insertElementInline(referanseelement,element);
        
        //synligjør editbar
        document.getElementById("editornewwrapper").style.display = "block";
        
        //skjuler editlinje
        referanseelement.style.display = "none";
        element.dataset.hideobject = referanseelement.id;
    
    
}
     
function insertElementInline(referanseelement,element){
     // Get the list and the reference item
            var list = referanseelement.parentElement;
    
            // Insert the new item after item 2
            if (referanseelement.nextSibling) {
                list.insertBefore(element, referanseelement.nextSibling);
            } else {
                list.appendChild(element);
            }
}
    
function cancleEdit(){
    const element = document.getElementById("editornewwrapper");
    if(element.dataset.hideobject){
            //synligjør tidligere skjult element
            document.getElementById(element.dataset.hideobject).style.display = "grid";
    }
    
    element.style.display = "none";
    //reseteditwrapperinput();
    //ny linjeknappen
    document.getElementById("addnewlinehandelbutton").style.display = "inline-block";
    document.getElementById("addnewlinebistandbutton").style.display = "inline-block";
}
    
function deleteLine(airtable){
    
    DELETEairtable(baseid,"tblkNYRENn5QFG0CD",airtable,"responsdeletevolum");
      
    //synligjør melding
    document.getElementById("savinglinewrapper").style.display = "flex";
    document.getElementById("prosessmessagetext").innerHTML = "Sletter ..."
    
    //skjule data
    document.getElementById("maineditrow").style.display = "none";
    document.getElementById("infoinputwrapper").style.display = "none";
}

function loadEditwrapper(data){

    //velge oppsett
    showhideeditwraper(data.type);
    
    //wrapper
    const element = document.getElementById("editornewwrapper");
    element.dataset.airtable = data.airtable;
    
    const supplierinput = document.getElementById("dropdownInputsupplier");
    supplierinput.value =  data.suppliertext || data.suppliername;
    if(!data?.suppliertext){
        //legge til airtable
        supplierinput.dataset.airtable = data.supplier[0];  
    }
     
    if(data.type == "handel"){
        //value
        const mainValue = document.getElementById("valueinput");
        const cutSetting = document.getElementById("cutinput");
        const cutValue = document.getElementById("cutvalueinput");

        if(data?.quantity>0){
        //dette er en volum enhet og ikke kroner
        let quantityname = data.supplierquantityname || "";
            //sjekke om det er Diesel eller Bensin, skriv da Drivstoff
            if(quantityname == "Diesel" || quantityname == "Bensin"){
                quantityname = "Drivstoff";
            }
        //dette er en volum enhet og ikke kroner
        let quantityunitLable = data.supplierquantityunit;
        if (data.supplierquantityunit == "Liter"){
            //forkortelse til "L"
            quantityunitLable = "L";
        }

        //skal en vise K eller ikke
        if(data?.quantity>1999){
            mainValue.value = (Number(data.quantity)/1000).toLocaleString("nb-NO") + "K " + quantityunitLable+" "+quantityname;
        }else{
            mainValue.value = data[i].quantity.toLocaleString("nb-NO") + " " + quantityunitLable+" "+quantityname;
        }

    
    //besparelse pr enhet
        

        let localsavingsperquantity = data.localsavingsperquantity || 0;
        let lable = "";

        //må finne ut om det er best å hvise øre eller krone
        if(data?.supplierquantityunit == "Liter"){
            //vis øre
            localsavingsperquantity = localsavingsperquantity*100;
            lable = valutalook(round(localsavingsperquantity, 0))+"øre/L";
        }else{
            //vis krone
            lable = valutalook(round(localsavingsperquantity, 2))+" Kr/"+quantityunitLable;
        }
        cutSetting.value = lable;
        
        }else {
            //da er det kroner
            mainValue.innerHTML = valutalook(round(data.value, 0))+" Kr";

            let cutSettingNumber = data.localcut || data.defaultcut || 0;
            cutSetting.value = round(Number(cutSettingNumber)*100, 2)+"%";

        }
        //cutvalue
        let besparelse = data[i].cutvalue || 0;
        cutValue.value = valutalook(round(besparelse))+" Kr";
    
    }else if (data.type == "bistand"){
      //mark
            var mark = "";
            if(data?.mark){
             mark = data.mark; 
            }
      document.getElementById("markinput").value = mark;
      document.getElementById("bvalueinput").value = valutalook(round(data.bistandvalue,0))+" Kr";
    }else if (data.type == "analyse"){
      //mark
            var mark = "";
            if(data?.mark){
             mark = data.mark; 
            }
      document.getElementById("markinput").value = mark;
      document.getElementById("avalueinput").value = valutalook(round(data.analysevalue,0))+" Kr";
    }
     
     
     
    //datevolum
    var date = "";
                    if(data?.date){
                    date =  data.date;
                    }else if(data?.periodeend){
                    date = data.periodeend;
                    }
     document.getElementById("datevolum").value = date;
     //note
     var note = "";
     if(data?.note){
        note = data.note; 
     }
     document.getElementById("notataddvolum").value = note;
     //delete
     document.getElementById("deleteeditbutton").style.display = "inline-block";
     document.getElementById("deleteeditbutton").onclick = function() {
                    deleteLine(data.airtable);
                        };
}
     
function reseteditwrapperinput(){
    document.getElementById("savinglinewrapper").style.display = "none";
    document.getElementById("listcopyholderlines").style.display = "none";
    document.getElementById("deleteeditbutton").style.display = "none";
    document.getElementById("maineditrow").style.display = "grid";
    document.getElementById('editfunctionbutton').dataset.count = "0";
    const element = document.getElementById("editornewwrapper");
     element.removeAttribute('data-airtable');
    document.getElementById("datevolum").value = makeToDaytring(); 
    document.getElementById("valueinput").value = "10 000 Kr";
    document.getElementById("cutinput").value = "10.00 %";
    document.getElementById("cutinput").style.color = 'black';
    document.getElementById("cutvalueinput").innerHTML = "1000 Kr";
    document.getElementById("dropdownInputsupplier").value = "";
    document.getElementById("dropdownInputsupplier").removeAttribute('data-airtable');
    document.getElementById("notataddvolum").value = "";
    document.getElementById("markinput").value = "";
    document.getElementById("markinput").placeholder = "Merk ...";
    document.getElementById("bvalueinput").value = "5000 Kr";
    //flytter editorwrapper vekk fra list element
    document.getElementById("listparrentholder").appendChild(document.getElementById("editornewwrapper"));
    //flytte multilineswrapper ut fra list element
    document.getElementById("listparrentholder").appendChild(document.getElementById("listcopyholderlines"));
    
    //ny linjeknappen
    document.getElementById("addnewlinehandelbutton").style.display = "inline-block";
    document.getElementById("addnewlinebistandbutton").style.display = "inline-block";
    document.getElementById("addnewlineanalysebutton").style.display = "inline-block";
    }

function makeeditfunction(state){
        
        const editbuttons = document.getElementsByClassName("editwrapper");
        
        for(var i = 0;i<editbuttons.length;i++){
            if(state){
            editbuttons[i].style.display = "flex";
            }else{
            editbuttons[i].style.display = "none";  
            }
        }
        
}
    
function showhideeditwraper(type){
    document.getElementById("editornewwrapper").dataset.type = type;
    
    if(type == "handel"){
        document.getElementById("dropdownInputsupplier").style.display = "block";
        document.getElementById("valueinput").style.display = "block";
        document.getElementById("cutinput").style.display = "block";
        document.getElementById("cutvalueinput").style.display = "block";
        document.getElementById("datevolum").style.display = "block";
    
        document.getElementById("markinput").style.display = "none";
        document.getElementById("bvalueinput").style.display = "none";
        document.getElementById("avalueinput").style.display = "none";
        
    }else if(type == "bistand"){
        document.getElementById("dropdownInputsupplier").style.display = "block";
        document.getElementById("markinput").style.display = "block";
        document.getElementById("bvalueinput").style.display = "block";
        document.getElementById("datevolum").style.display = "block";
        
        document.getElementById("valueinput").style.display = "none";
        document.getElementById("cutinput").style.display = "none";
        document.getElementById("cutvalueinput").style.display = "none"; 
        document.getElementById("avalueinput").style.display = "none";
        
    }else if(type == "analyse"){
        document.getElementById("dropdownInputsupplier").style.display = "block";
        document.getElementById("markinput").style.display = "block";
        document.getElementById("avalueinput").style.display = "block";
        document.getElementById("datevolum").style.display = "block";
        
        document.getElementById("bvalueinput").style.display = "none";
        document.getElementById("valueinput").style.display = "none";
        document.getElementById("cutinput").style.display = "none";
        document.getElementById("cutvalueinput").style.display = "none"; 
        
    }
    
    
}

function supplierSelected(id,name,cut){
    
    //sette hele navnet inn
    const input = document.getElementById("dropdownInputsupplier");
    input.value = name;
    input.dataset.airtable = id;

    // Finn eventuell eksisterende besparelsesfaktor for denne kunde på denne leverandøren
    const match = SelectedCompanyInFirstTab.cutsettings.find(item => item.supplier === id);

    if (match) {
        //kunden har en satt rabatt hos denne leverandøren benytt denne
        document.getElementById("cutinput").value = (match.cut)+"%";
        //sett fargen til grønn
        document.getElementById("cutinput").style.color = 'green';
    } else if (cut) {
        //kunden har ikke en satt rabatt hos denne leverandøren
            document.getElementById("cutinput").value = (cut*100)+"%"
            document.getElementById("cutinput").style.color = '#B8860B';
    }else{
        //verken kunden eller leverandøren har en standard verdi
            document.getElementById("cutinput").style.color = 'black';
    }
    
}