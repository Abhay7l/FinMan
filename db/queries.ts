import { cache, use } from "react";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { challengeProgress, challenges, courses, lessons, units, userProgress, userSubscription } from "./schema";
import { DAY_IN_MS } from "@/constants";


export const getCourses = cache(async () => {
    const data = await db.query.courses.findMany();

    return data;
});

export const getUserProgress = cache(async () => {
    const { userId } = await auth();

    if(!userId) {
        return null;
    }

    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        //from all the userPorgresses select the userProgress of the current user with its active course.
        with: {
            activeCourse: true,
        },
    });

    return data;
});

export const getUnits = cache(async () => {
    const { userId } = await auth();
    // first get the current user's progress.
    const userProgress = await getUserProgress();
    // check if the current user has any active courses.
    if(!userProgress?.activeCourseId || !userId){
        return [];
    }

    // const query = `
    // SELECT DISTINCT u.*, l.*, c.*, cp.*
    // FROM units u
    // LEFT JOIN lessons l ON u.unitId = l.unitId
    // LEFT JOIN challenges c ON l.lessonId = c.lessonId
    // LEFT JOIN challengeProgress cp ON c.challengeId = cp.challengeId
    // WHERE u.courseId = ${userProgress.activeCourseId}
    // `;
    
    // const data = await db.query(query);

    const data = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        // from all the units, select the units for the active course.
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            // get all lessons of the unit.
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                // get all challenges of the lesson.
                with: {
                    challenges: {
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
                        // get the challenge progress of the challenge for the current user .
                        with: {
                            challengeProgress: {
                                where: eq(
                                    challengeProgress.userId, userId
                                )
                            },
                        }
                    }
                }
            }
        }
    });

    // while returning the units we normalize it so, that it includes the completed status;
    const normalizedData = data.map((unit) => {
        const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
            if(lesson.challenges.length === 0){
                return { ...lesson, completed: false };
            }
            const allCompletedChallenges = lesson.challenges.every((challenge) => {
                return challenge.challengeProgress && 
                       challenge.challengeProgress.length > 0
                       challenge.challengeProgress.every((progress) => progress.completed);
            });
            return { ...lesson, completed: allCompletedChallenges }
        });
        return { ...unit, lessons: lessonsWithCompletedStatus}
    });  

    return normalizedData;
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
        with: {
            units: {
                orderBy: (units, { asc }) => [asc(lessons.order)],
                with: {
                    lessons: {
                        orderBy: (lessons, { asc }) => [asc(lessons.order)],
                    }
                }
            },
        },
    });

    return data;
});

export const getCourseProgress = cache(async () => {
    const { userId } = await auth();
    // userProgress will return the data (userId, name, image, activeCourseId, hearts, points, activeCourse) of the current user.
    const userProgress = await getUserProgress();

    if(!userId || !userProgress?.activeCourseId) {
        return null;
    }
    const unitsInActiveCourse = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        // units in active course for current user.
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            // all the lessons within the unit.
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    unit: true,
                    // all the challenges witin the lesson.
                    challenges: {
                        with: {
                            // among the challenge Progress of all the users for the challenge select the challenge progress for only the current user.
                            challengeProgress: {
                                where: eq(challengeProgress.userId, userId),
                            }
                        }
                    }
                }
            }
        }
    });
    // const unitsInActiveCourse: {
    //     id: number;
    //     title: string;
    //     description: string;
    //     courseId: number;
    //     order: number;
    //     lessons: {
    //         id: number;
    //         title: string;
    //         order: number;
    //         unitId: number;
    //         unit: {
    //             id: number;
    //             title: string;
    //             description: string;
    //             courseId: number;
    //             order: number;
    //         };
    //         challenges: {
    //             ...;             
    //             challengeProgress: {
    //                  ...;         
    //              };
    //         }[];
    //     }[];
    // }[]
    
    const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
        return lesson.challenges.some((challenge) => {
            return !challenge.challengeProgress     // challenge for which there is no challenge progress
            || challenge.challengeProgress.length === 0  // 
            || challenge.challengeProgress.some((progress) => progress.completed === false  // completed field for a challenge progress is false;
            )
        });
    });

    return {
        activeLesson: firstUncompletedLesson,
        activeLessonId: firstUncompletedLesson?.id
    };
});


export const getLesson = cache(async (id?: number) => {
    const  { userId } = await auth();
    if(!userId) {
        return null;
    }
    const courseProgress =await getCourseProgress();

    // if user provides an id than we select that lesson else we select the first uncompleted lesson;
    const lessonId = id || courseProgress?.activeLessonId;
    if(!lessonId) {
        return null;
    }

    const data = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)], 
                with: {
                    challengeOptions: true,
                    challengeProgress: {
                        where: eq(challengeProgress.userId, userId),
                    },
                },
            },
        },
    });
    
    if(!data || !data.challenges) {
        return null;
    }

    const normalizedChallenges = data.challenges.map((challenge) => {
        const completed = challenge.challengeProgress 
        && challenge.challengeProgress.length > 0
        && challenge.challengeProgress.every((progress) => progress.completed);


        return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedChallenges}
});


export const getLessonPercentage = cache(async () => {
    const courseProgress = await getCourseProgress();
    if(!courseProgress?.activeLessonId) {
        return 0;
    }

    const lesson = await getLesson(courseProgress.activeLessonId);

    if(!lesson){
        return 0;
    }

    const completedChallenges = lesson.challenges.filter((challenge) => challenge.completed);
    const percentage = Math.round(
        (completedChallenges.length / lesson.challenges.length) * 100,
    );
    return percentage;
});

;

export const getUserSubscription = cache(async () => {
    const { userId } = await auth();

    if(!userId)return null;

    const data = await db.query.userSubscription.findFirst({
        where: eq(userSubscription.userId, userId),
    });

    if(!data)return null;

    const isActive = 
        data.stripePriceId && 
        data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return {
        ...data,
        isActive: !!isActive,
    };
});

export const getTopTenUsers = cache(async () => {
    const { userId } = await auth();
    
    if(!userId){
        return [];
    }
    
    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit: 10,
        columns: {
            userId: true,
            userName: true,
            userImageSrc: true,
            points: true,
        },
    });

    return data;
})