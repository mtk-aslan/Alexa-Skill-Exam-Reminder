{
    "interactionModel": {
        "languageModel": {
            "invocationName": "exam calculator",
            "intents": [
                {
                    "name": "CreateReminderIntent",
                    "slots": [
                        {
                            "name": "subject",
                            "type": "AMAZON.LocalBusinessType",
                            "samples": [
                                "It was {subject}",
                                "I said {subject}",
                                "{subject}"
                            ]
                        },
                        {
                            "name": "date",
                            "type": "AMAZON.DATE",
                            "samples": [
                                "I said the {date}",
                                "I said {date}",
                                "it was the {date}",
                                "{date}"
                            ]
                        }
                    ],
                    "samples": [
                        "set a reminder for {subject} at {date}",
                        "set a reminder",
                        "create a reminder",
                        "new reminder"
                    ]
                },
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                },
                {
                    "name": "GetLearnProgress",
                    "slots": [
                        {
                            "name": "subject",
                            "type": "AMAZON.LocalBusinessType",
                            "samples": [
                                "i said {subject}",
                                "{subject}"
                            ]
                        }
                    ],
                    "samples": [
                        "How am I in {subject}",
                        "How is my Learnprogress in {subject}"
                    ]
                },
                {
                    "name": "UpdateLearnProgress",
                    "slots": [
                        {
                            "name": "subject",
                            "type": "AMAZON.LocalBusinessType",
                            "samples": [
                                "I said {subject}",
                                "{subject}"
                            ]
                        },
                        {
                            "name": "percentage",
                            "type": "AMAZON.NUMBER",
                            "samples": [
                                "{percentage} percent",
                                "I said {percentage} percent",
                                "I said {percentage}",
                                "{percentage}"
                            ]
                        }
                    ],
                    "samples": [
                        "Please raise {subject} to {percentage} percent",
                        "Update {subject} to {percentage} percent"
                    ]
                }
            ],
            "types": []
        },
        "dialog": {
            "intents": [
                {
                    "name": "CreateReminderIntent",
                    "confirmationRequired": true,
                    "prompts": {
                        "confirmation": "ConfirmCreateReminderIntent"
                    },
                    "slots": [
                        {
                            "name": "subject",
                            "type": "AMAZON.LocalBusinessType",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Slot.1081620352794.1240937438910"
                            }
                        },
                        {
                            "name": "date",
                            "type": "AMAZON.DATE",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Slot.1081620352794.604651645761"
                            }
                        }
                    ]
                },
                {
                    "name": "UpdateLearnProgress",
                    "confirmationRequired": true,
                    "prompts": {
                        "confirmation": "Confirm.Intent.1441326619964"
                    },
                    "slots": [
                        {
                            "name": "subject",
                            "type": "AMAZON.LocalBusinessType",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Slot.47240330426.37904617379"
                            }
                        },
                        {
                            "name": "percentage",
                            "type": "AMAZON.NUMBER",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Slot.47240330426.973230996533"
                            }
                        }
                    ]
                },
                {
                    "name": "GetLearnProgress",
                    "confirmationRequired": false,
                    "prompts": {},
                    "slots": [
                        {
                            "name": "subject",
                            "type": "AMAZON.LocalBusinessType",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Slot.243983468907.1272831024769"
                            }
                        }
                    ]
                }
            ],
            "delegationStrategy": "ALWAYS"
        },
        "prompts": [
            {
                "id": "ConfirmCreateReminderIntent",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Should I remind you at {date} for your {subject} class?"
                    }
                ]
            },
            {
                "id": "Elicit.Slot.1081620352794.1240937438910",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "I didnt get the subject. Can you please repeat it?"
                    }
                ]
            },
            {
                "id": "Elicit.Slot.1081620352794.604651645761",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "I didnt get the Date. Can you please repeat the date?"
                    }
                ]
            },
            {
                "id": "Confirm.Intent.1441326619964",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Is that right {subject} to {percentage} percent."
                    }
                ]
            },
            {
                "id": "Elicit.Slot.47240330426.973230996533",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "I didnt get the percentage. Can you please repeat?"
                    }
                ]
            },
            {
                "id": "Confirm.Slot.47240330426.973230996533",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Did you said {percentage} percent"
                    }
                ]
            },
            {
                "id": "Elicit.Slot.47240330426.37904617379",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "i didnt get the subject. Can you please repeat?"
                    }
                ]
            },
            {
                "id": "Confirm.Slot.47240330426.37904617379",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Did you said {subject}"
                    }
                ]
            },
            {
                "id": "Elicit.Slot.243983468907.1272831024769",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "I didnt get the subject. can you repeat it?"
                    }
                ]
            }
        ]
    }
}
