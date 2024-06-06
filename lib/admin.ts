import { auth } from "@clerk/nextjs"

const adminIds = [
    "user_2doo0pRoHZUnQuTbS4CKjFwiB3l",
];

export const isAdmin = () => {
    const { userId } = auth(); 

    if(!userId){
        return null;
    }

    return adminIds.indexOf(userId) !== -1;
}
