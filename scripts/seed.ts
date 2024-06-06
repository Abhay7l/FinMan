import "dotenv/config";
import {drizzle} from "drizzle-orm/neon-http";
import {neon} from "@neondatabase/serverless";

import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore
const db = drizzle(sql, { schema});

const main = async () => {
    try{
        console.log("Seeding database");
        await db.delete(schema.courses);
        await db.delete(schema.userProgress);
        await db.delete(schema.units);
        await db.delete(schema.lessons);
        await db.delete(schema.challenges);
        await db.delete(schema.challengeOptions);
        await db.delete(schema.challengeProgress);
        await db.delete(schema.userSubscription);
        
        await db.insert(schema.courses).values([
            {
                id: 1,
                title: "Personal Finance",
                imageSrc: "/pf.svg"
            },
            {
                id: 2,
                title: "Investing",
                imageSrc: "/inv.svg"
            },
            {
                id: 3,
                title: "Corporate Finance",
                imageSrc: "/cf.svg"
            },
            {
                id: 4,
                title: "Financial Markets",
                imageSrc: "/fm.svg"
            },
        ]);

        await db.insert(schema.units).values([
            {
                id: 1,
                courseId: 1,
                title: "Unit 1",
                description: "Learn the basics of Personal Finance",
                order: 1,
            }
        ]);

        await db.insert(schema.lessons).values([
            {
                id: 1,
                unitId: 1,
                title: "Budgeting",
                order: 1,
            },
            {
                id: 2,
                unitId: 1,
                title: "Savings",
                order: 2,
            },
            {
                id: 3,
                unitId: 1,
                title: "Verbs",
                order: 3,
            },
            {
                id: 4,
                unitId: 1,
                title: "Verbs",
                order: 4,
            },
            {
                id: 5,
                unitId: 1,
                title: "Verbs",
                order: 5,
            }
        ]);

        await db.insert(schema.challenges).values([
            {
                id: 1,
                lessonId: 1,
                type: "SELECT",
                order: 1,
                question: 'Which of the following is NOT a component of a typical budget?'
            },
            {
                id: 2,
                lessonId: 1,
                type: "SELECT",
                order: 2,
                question: 'Which of the following is NOT typically considered an essential expense?'
            },
            {
                id: 3,
                lessonId: 1,
                type: "SELECT",
                order: 3,
                question: 'What is the 50/30/20 rule in budgeting?'
            },
        ]);

        await db.insert(schema.challengeOptions).values([
            {
                challengeId: 1, //Which one of these is the "The man?"
                imageSrc: "/man.svg",
                correct: false,
                text: "Income",
                audioSrc: "/es_man.mp3"
            },
            {
                challengeId: 1, //Which one of these is the "The man?"
                imageSrc: "/woman.svg",
                correct: false,
                text: "Expenses",
                audioSrc: "/es_woman.mp3"
            },
            {
                challengeId: 1, //Which one of these is the "The man?"
                imageSrc: "/robot.svg",
                correct: true,
                text: "Liabilities",
                audioSrc: "/es_robot.mp3"
            },
            {
                challengeId: 1, //Which one of these is the "The man?"
                imageSrc: "/robot.svg",
                correct: false,
                text: "Investments",
                audioSrc: "/es_robot.mp3"
            }
        ])
        await db.insert(schema.challengeOptions).values([
            {
                challengeId: 2, //
                correct: false,
                text: "Rent",
                audioSrc: "/es_man.mp3"
            },
            {
                challengeId: 2, 
                correct: false,
                text: "Groceries",
                audioSrc: "/es_woman.mp3"
            },
            {
                challengeId: 2, 
                correct: true,
                text: "Dining out",
                audioSrc: "/es_robot.mp3"
            },
            {
                challengeId: 2, 
                correct: false,
                text: "Utilities",
                audioSrc: "/es_robot.mp3"
            }
        ]);

        await db.insert(schema.challengeOptions).values([
            {
                challengeId: 3, //Which one of these is the "The man?"
                imageSrc: "/man.svg",
                correct: true,
                text: "50% needs, 30% wants, 20% savings",
                audioSrc: "/es_man.mp3"
            },
            {
                challengeId: 3, //Which one of these is the "The man?"
                imageSrc: "/woman.svg",
                correct: false,
                text: "50% savings, 30% needs, 20% wants",
                audioSrc: "/es_woman.mp3"
            },
            {
                challengeId: 3, //Which one of these is the "The man?"
                imageSrc: "/robot.svg",
                correct: false,
                text: "50% wants, 30% savings, 20% needs",
                audioSrc: "/es_robot.mp3"
            },
            {
                challengeId: 3, //Which one of these is the "The man?"
                imageSrc: "/robot.svg",
                correct: false,
                text: "50% investments, 30% savings, 20% needs",
                audioSrc: "/es_robot.mp3"
            }
        ]);

        // await db.insert(schema.challenges).values([
        //     {
        //         id: 4,
        //         lessonId: 2,
        //         type: "SELECT",//verbs
        //         order: 1,
        //         question: 'Which one of these is the "The man?",'
        //     }
        // ]);
        // await db.insert(schema.challengeOptions).values([
        //     {
        //         challengeId: 4, //Which one of these is the "The man?"
        //         imageSrc: "/man.svg",
        //         correct: true,
        //         text: "el hombre",
        //         audioSrc: "/es_man.mp3"
        //     },
        //     {
        //         challengeId: 4, //Which one of these is the "The man?"
        //         imageSrc: "/woman.svg",
        //         correct: false,
        //         text: "la mujer",
        //         audioSrc: "/es_woman.mp3"
        //     },
        //     {
        //         challengeId: 4, //Which one of these is the "The man?"
        //         imageSrc: "/robot.svg",
        //         correct: false,
        //         text: "el robot",
        //         audioSrc: "/es_robot.mp3"
        //     }
        // ])

        console.log("Seeding finished");
    }catch(error){
        console.log(error);
        throw new Error("Failed to seed the database");
    }
}

main();