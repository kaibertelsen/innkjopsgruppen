

function startRutingUser(member){
if(memberObject){
//hente user object
        GETairtable(
        "app1WzN1IxEnVu3m0",
        "tblMhgrvy31ihKYbr",
        member.airtableid,
        "userObjectResponse"
        );
    }
}

function userObjectResponse(data) {
    let userObject = data.fields;
    if (userObject?.companyslug) {
        // Redirect to the company-specific page
        let address = `https://portal.innkjops-gruppen.no/firma/${userObject.companyslug[0]}`;
        window.location.href = address;
    } else {
        // Handle the case where companyslug doesn't exist
        console.log("Company slug not found. Taking fallback action.");
    }
}


function ruteresponse(data,id){
    if(id == "userObjectResponse"){
        userObjectResponse(data);
    }
}