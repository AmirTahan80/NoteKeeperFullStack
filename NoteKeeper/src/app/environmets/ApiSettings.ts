export class ApiBaseSettings{
    baseUrl ="http://localhost:5220/api";
}

export class ApiUrlSettings{
    //Authentication
    signIn ="/user/Login";
    singUp="/user/register";

    createNoteSetting="/AddNote/CreateNoteSetting";
    getNoteSettings="/addnote/getnotes";
    getNoteSettingItems="/addnote/getnoteitems";
    createNoteSettingItem="/addnote/createnoteitem";
    getNoteItem="/addnote/GetNoteItemById";
}