function startFollowinglistElement(data){

    console.log(data);

    const list = document.getElementById("followuplist");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementlibrary = document.getElementById("elementholderfollowup");
    const nodeElement = elementlibrary.querySelector('.rowelementmanuel');

    for (let company of data) {
        const rowelement = nodeElement.cloneNode(true);
        list.appendChild(rowelement);

        const companyname = rowelement.querySelector(".companynamelable");
        companyname.textContent = company.Name;
        
        const winningdate = rowelement.querySelector(".winningdate");
        winningdate.textContent = company.winningdate;

        const lastfollowingup = rowelement.querySelector(".lastfollowingup");
        lastfollowingup.textContent = company.lastfollowupdate;

        const daysagain = rowelement.querySelector(".daysagain");
        daysagain.textContent = company.daytorenewal;

        const rewaldate = rowelement.querySelector(".rewaldate");
        rewaldate.textContent = company.nextrenewaldate;
    }

}
