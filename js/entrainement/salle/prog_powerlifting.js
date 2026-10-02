/* =========================================================
   LUXA_FIT
   PROGRAMME POWERLIFTING
   STRUCTURE DES SÉANCES
   ========================================================= */


/* =========================================================
   PROGRAMMES PAR NOMBRE DE SÉANCES
   ========================================================= */

const powerliftingPrograms = {


    /* =====================================================
       3 SÉANCES
       FULL BODY
    ===================================================== */

    3: {

        title: "Powerlifting — 3 séances",

        description:
            "Un programme Full Body permettant de développer régulièrement le squat, le bench press et le deadlift avec une récupération suffisante.",

        days: [

            {
                day: "Lundi",
                title: "Squat + Bench",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 4,
                        reps: 5,
                        percentage: 0.75
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 4,
                        reps: 5,
                        percentage: 0.75
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    },

                    {
                        name: "Leg Curl",
                        type: "accessory",
                        sets: 3,
                        reps: 10
                    }

                ]
            },


            {
                day: "Mercredi",
                title: "Deadlift + Bench",

                exercises: [

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 3,
                        reps: 5,
                        percentage: 0.75
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 4,
                        reps: 6,
                        percentage: 0.70
                    },

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 3,
                        reps: 6,
                        percentage: 0.65
                    },

                    {
                        name: "Tractions",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            },


            {
                day: "Vendredi",
                title: "Squat + Deadlift",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 4,
                        reps: 4,
                        percentage: 0.80
                    },

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 3,
                        reps: 5,
                        percentage: 0.70
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 4,
                        percentage: 0.75
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            }

        ]
    },



    /* =====================================================
       4 SÉANCES
       UPPER / LOWER
    ===================================================== */

    4: {

        title: "Powerlifting — 4 séances",

        description:
            "Une organisation équilibrée permettant de travailler les trois mouvements plusieurs fois par semaine tout en répartissant la fatigue.",

        days: [

            {
                day: "Lundi",
                title: "Squat + Bench",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 4,
                        reps: 5,
                        percentage: 0.75
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 4,
                        reps: 5,
                        percentage: 0.75
                    },

                    {
                        name: "Romanian Deadlift",
                        type: "accessory",
                        sets: 3,
                        reps: 8
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            },


            {
                day: "Mardi",
                title: "Deadlift + Bench",

                exercises: [

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 3,
                        reps: 5,
                        percentage: 0.75
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 5,
                        percentage: 0.72
                    },

                    {
                        name: "Tractions",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    },

                    {
                        name: "Leg Curl",
                        type: "accessory",
                        sets: 3,
                        reps: 10
                    }

                ]
            },


            {
                day: "Jeudi",
                title: "Squat Volume + Bench",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 4,
                        reps: 6,
                        percentage: 0.70
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 4,
                        reps: 6,
                        percentage: 0.70
                    },

                    {
                        name: "Bulgarian Split Squat",
                        type: "accessory",
                        sets: 3,
                        reps: 8
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 10
                    }

                ]
            },


            {
                day: "Samedi",
                title: "Deadlift + Bench",

                exercises: [

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 4,
                        reps: 3,
                        percentage: 0.80
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 3,
                        percentage: 0.80
                    },

                    {
                        name: "Romanian Deadlift",
                        type: "accessory",
                        sets: 3,
                        reps: 6
                    },

                    {
                        name: "Tractions",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            }

        ]
    },



    /* =====================================================
       5 SÉANCES
    ===================================================== */

    5: {

        title: "Powerlifting — 5 séances",

        description:
            "Une fréquence élevée permettant de pratiquer régulièrement les mouvements principaux avec une spécialisation supplémentaire du bench press.",

        days: [

            {
                day: "Lundi",
                title: "Squat lourd + Bench",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 4,
                        reps: 4,
                        percentage: 0.80
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 4,
                        reps: 5,
                        percentage: 0.75
                    },

                    {
                        name: "Leg Curl",
                        type: "accessory",
                        sets: 3,
                        reps: 10
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            },


            {
                day: "Mardi",
                title: "Deadlift + Bench",

                exercises: [

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 3,
                        reps: 4,
                        percentage: 0.80
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 3,
                        percentage: 0.80
                    },

                    {
                        name: "Tractions",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    },

                    {
                        name: "Triceps",
                        type: "accessory",
                        sets: 3,
                        reps: 10
                    }

                ]
            },


            {
                day: "Jeudi",
                title: "Squat Volume + Bench",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 4,
                        reps: 6,
                        percentage: 0.70
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 4,
                        reps: 6,
                        percentage: 0.70
                    },

                    {
                        name: "Romanian Deadlift",
                        type: "accessory",
                        sets: 3,
                        reps: 8
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 10
                    }

                ]
            },


            {
                day: "Vendredi",
                title: "Deadlift lourd",

                exercises: [

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 4,
                        reps: 2,
                        percentage: 0.85
                    },

                    {
                        name: "Bench Press pause",
                        type: "bench",
                        sets: 4,
                        reps: 5,
                        percentage: 0.70
                    },

                    {
                        name: "Leg Curl",
                        type: "accessory",
                        sets: 3,
                        reps: 10
                    },

                    {
                        name: "Tractions",
                        type: "accessory",
                        sets: 3,
                        reps: 8
                    }

                ]
            },


            {
                day: "Samedi",
                title: "Bench Volume",

                exercises: [

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 5,
                        percentage: 0.72
                    },

                    {
                        name: "Incline Bench Press",
                        type: "accessory",
                        sets: 3,
                        reps: 8
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    },

                    {
                        name: "Élévations latérales",
                        type: "accessory",
                        sets: 3,
                        reps: 12
                    }

                ]
            }

        ]
    },



    /* =====================================================
       6 SÉANCES
    ===================================================== */

    6: {

        title: "Powerlifting — 6 séances",

        description:
            "Une fréquence élevée destinée aux pratiquants capables de récupérer correctement entre les séances.",

        days: [

            {
                day: "Lundi",
                title: "Squat lourd + Bench",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 5,
                        reps: 3,
                        percentage: 0.82
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 4,
                        percentage: 0.77
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            },


            {
                day: "Mardi",
                title: "Deadlift + Bench",

                exercises: [

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 4,
                        reps: 3,
                        percentage: 0.80
                    },

                    {
                        name: "Bench Press pause",
                        type: "bench",
                        sets: 4,
                        reps: 5,
                        percentage: 0.70
                    },

                    {
                        name: "Tractions",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            },


            {
                day: "Mercredi",
                title: "Squat Volume",

                exercises: [

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 4,
                        reps: 6,
                        percentage: 0.70
                    },

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 4,
                        reps: 6,
                        percentage: 0.70
                    },

                    {
                        name: "Romanian Deadlift",
                        type: "accessory",
                        sets: 3,
                        reps: 8
                    }

                ]
            },


            {
                day: "Jeudi",
                title: "Bench lourd",

                exercises: [

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 3,
                        percentage: 0.82
                    },

                    {
                        name: "Close Grip Bench",
                        type: "accessory",
                        sets: 3,
                        reps: 6
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 8
                    }

                ]
            },


            {
                day: "Vendredi",
                title: "Deadlift + Squat léger",

                exercises: [

                    {
                        name: "Deadlift",
                        type: "deadlift",
                        sets: 3,
                        reps: 3,
                        percentage: 0.75
                    },

                    {
                        name: "Squat",
                        type: "squat",
                        sets: 3,
                        reps: 5,
                        percentage: 0.65
                    },

                    {
                        name: "Leg Curl",
                        type: "accessory",
                        sets: 3,
                        reps: 10
                    }

                ]
            },


            {
                day: "Samedi",
                title: "Bench Volume",

                exercises: [

                    {
                        name: "Bench Press",
                        type: "bench",
                        sets: 5,
                        reps: 5,
                        percentage: 0.72
                    },

                    {
                        name: "Incline Bench Press",
                        type: "accessory",
                        sets: 3,
                        reps: 8
                    },

                    {
                        name: "Rowing",
                        type: "accessory",
                        sets: 4,
                        reps: 10
                    },

                    {
                        name: "Biceps",
                        type: "accessory",
                        sets: 3,
                        reps: 10
                    }

                ]
            }

        ]
    }

};