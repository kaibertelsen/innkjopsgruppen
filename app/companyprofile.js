
function companyPageChosed(company) {
   
    // Simulerer klikk på elementet
    document.getElementById("tabcompany").click();

    const conteinerpage = document.getElementById("companyconteinerpage");

    // Sett logo
      const logo = conteinerpage.querySelector('.subpagelogo');
      if (logo) {
          if (company.logo) {
              logo.src = company.logo;
              logo.style.display = "inline-block";
          } else {
            logo.style.display = "none";
          }
    }
    
    // Oppdaterer data på selskapet
    let name = conteinerpage.querySelector('.companyname');
    name.textContent = company.Name || "-";

    let orgnr = conteinerpage.querySelector('.orgnr');
    orgnr.textContent = company.orgnr || "-";

    let groupname = conteinerpage.querySelector('.group');
    groupname.textContent = company.groupname || "-";

    let adress = conteinerpage.querySelector('.adress');
    adress.textContent = company.adresse || "-";

    let post = conteinerpage.querySelector('.post');
    adress.textContent = company.postnr+" "+company.poststed;

    preLists(company);
}

function preLists(company){

let users = company.bruker;
// Sorter brukere alfabetisk basert på 'name', med fallback for manglende navn
users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));   

//liste alle hovedbrukere
const list = document.getElementById("memberholderlist");
listCompanyUsers(users.filter(user => user.rolle !== "ansatt"),list,company);

const listpri = document.getElementById("memberpriholderlist");
listCompanyUsers(users.filter(user => user.rolle == "ansatt"),listpri,company);

}

function listCompanyUsers(users,list,company){
 
    if (!list) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }
    list.innerHTML = '';
    
    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".membercardwrapper");
    if (!nodeElement) {
        console.error("Ingen '.suppliercard' funnet i 'elementlibrary'.");
        return;
    }

    users.forEach(member => {
      const memberElement = nodeElement.cloneNode(true);

      let name = memberElement.querySelector('.name');
      name.textContent = member.navn || "-";

      let email = memberElement.querySelector('.email');
      email.textContent = member.epost || "-";

        let roll = memberElement.querySelector('.roll');
        let rollSelector = memberElement.querySelector('.rollSelector');

        if (userObject?.rolle === "Admin") {
            // Finn og sett riktig alternativ som aktiv i rollSelector
            const options = rollSelector.querySelectorAll('option');
            options.forEach(option => {
                if (option.value === member.rolle) {
                    option.selected = true;  // Sett alternativet som valgt
                }
            });

            // Legg til en 'change'-hendelse på rollSelector
            rollSelector.addEventListener('change', () => {
                rollSelectorChange(rollSelector,member,company);  // Kjør funksjonen når verdien endres
            });

            roll.style.display = "none";  // Skjul roll-elementet
        } else {
            // Sett rolle som tekst hvis det ikke er "Admin"
            roll.textContent = member?.rolle || "-";
            rollSelector.style.display = "none";  // Skjul rollSelector-elementet
        }

      list.appendChild(memberElement);

    });

}

function rollSelectorChange(selector, member, company) {
    // Hent valgt alternativs tekst fra selector
    const selectedText = selector.options[selector.selectedIndex].text;

    if(selector.value == "remove"){
        const confirmMessage = `Er du sikker på at du vil fjerne brukeren ${member.navn}\nfra ${company.Name}?`;
        if (confirm(confirmMessage)) {
            console.log("Ja fjern denne brukeren");
        }else{
            console.log("Nei avbryt fjerning av denne brukeren");
            selector.value = member.rolle;
        }

    }else{
       

        // Vis en bekreftelsesmelding
        const confirmMessage = `Bytte tilgang for ${member.navn}\nFra ${member.rolle} til ${selectedText} ?`;

        if (confirm(confirmMessage)) {
            console.log("Tilgang oppdatert for:", member);

            // Opprett body for oppdatering
            let body = { rolle: selector.value };

            // Oppdater server
            PATCHairtable(
                "app1WzN1IxEnVu3m0",
                "tblMhgrvy31ihKYbr",
                member.airtable,
                JSON.stringify(body),
                "responsrollChange"
            );

            // Oppdater verdi i company.bruker-arrayen
            let userToUpdate = company.bruker.find(u => u.airtable === member.airtable);
            if (userToUpdate) {
                userToUpdate.rolle = selector.value;
                preLists(company);


            } else {
                console.warn("Bruker ikke funnet i company.bruker-arrayen");
            }
        } else {
            // Sett tilbake forrige verdi hvis bekreftelsen avbrytes
            selector.value = member.rolle;
        }
    }
}

function responsrollChange(data){
console.log(data);
}