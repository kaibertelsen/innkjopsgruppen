function startFollowinglistElement(data){

    console.log(data);

    const list = document.getElementById("followuplist");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementlibrary = document.getElementById("elementholderfollowup");
    const nodeElement = contentholder.querySelector('.rowelementmanuel');
    for (let company of data) {
        const rowelement = nodeElement.cloneNode(true);
        list.appendChild(rowelement);

        const companyname = rowelement.querySelector(".companynamelable");
        companyname.textContent = ""
    }



}