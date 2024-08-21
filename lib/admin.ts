import { auth } from "@clerk/nextjs"

const adminIds = [
    "user_2kyEeFZ0o8QGIk3I1nThiITPxz2",
];

export const isAdmin = () => {
    const { userId } = auth(); 

    if(!userId){
        return null;
    }

    return adminIds.indexOf(userId) !== -1;
}
