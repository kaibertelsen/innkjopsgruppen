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

    let users = company.bruker;

    //liste alle hovedbrukere
    const list = document.getElementById("memberholderlist");
    listCompanyUsers(users.filter(user => user.rolle !== "ansatt"),list);

    const listpri = document.getElementById("memberpriholderlist");
    listCompanyUsers(users.filter(user => user.rolle == "ansatt"),listpri);
    
}

function listCompanyUsers(users,list){
 
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
      roll.textContent = member.rolle || "-";

      list.appendChild(memberElement);

    });






}