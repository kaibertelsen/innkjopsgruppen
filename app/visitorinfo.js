function saveInfo(){

    activeCompany;
    userObject;

    saveVisitorInfo({
        name: userObject.navn || "",
        phone: userObject.telefon || "",
        email: userObject.epost || "",
        companies: activeCompany.Name || "",
        orgnr: activeCompany.orgnr|| "",
        metadata: {plan: activeCompany.groupname || "" }
    });

}



function saveVisitorInfo(visitor) {
const clientId = window.bbConfig?.clientId;
if (!clientId) throw new Error("Missing bbConfig.clientId");

const key = `VisitorInfo_${clientId}`;

// Minimal normalisering / defaults
const payload = {
    name: visitor?.name || "",
    phone: visitor?.phone || "",
    email: visitor?.email || "",
    companies: visitor?.companies || visitor?.company || "",
    orgnr: visitor?.orgnr || visitor?.orgNr || "",
    metadata: (visitor?.metadata && typeof visitor.metadata === "object") ? visitor.metadata : {},
    updatedAt: new Date().toISOString()
};

localStorage.setItem(key, JSON.stringify(payload));
return payload;
}


/* Eksempelbruk:
saveVisitorInfo({
name: "Ola Nordmann",
phone: "+47 999 99 999",
email: "ola@kunde.no",
companies: "Kunde AS",
orgnr: "912345678",
metadata: { portalUserId: "u_123", plan: "Pro" }
});
*/