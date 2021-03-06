import React, { useState, useEffect } from "react";
import { Button, Navigation } from "../../components";
import { API, createToast } from "../../utils"
import './style.css';

function Invitation(props) {

    const [state, setState] = useState({
        courseName: "CSE 111 - Hardware Engineering",
        pending: true,
        accountType: null // Either "student" or "instructor" (indicates verification)
    });

    const history = props.history;
    const courseId = props.match.params.courseId;
    const inviteId = props.match.params.inviteId;

    useEffect(() => {
        API.getCourse(courseId, true).then((course) => {
            // Check if user is in course, if so immediately redirect
            if (!!course.data.type) {
                let link = `/courses/${course.data.courseId}`;
                history.push(link)
            }

            // Runs second backend request to verify
            API.confirmVerificationLink(courseId, inviteId).then((result) => {
                setState({
                    courseName: course.data.name,
                    pending: false,
                    accountType: result.data.type
                });
            }).catch((result) => {
                setState({
                    ...state,
                    pending: false
                })
            })
        }).catch(() => {
            // Default
            setState({
                ...state,
                pending: false
            })
        });
    }, [])

    const redirectHome = () => {
        createToast("Redirecting to home page...");
        history.push("/");
    }

    const redirectClass = () => {
        API.addToCourse(courseId, state.accountType).then((val) => {
            let link = `/courses/${courseId}`;
            createToast("Invitation accepted! Redirecting to course...");
            history.push(link);
            return null;
        }).catch((e) => createToast(e))
    }

    if (state.pending) {
        return <h1>Verifying Invite Link</h1>
    }

    if (!state.accountType) {
        return <h1>Invite Id is not Valid. Contact the instructor for this issue.</h1>
    }

    return (
        <div>
            <Navigation history={props.history} currentUser={props.currentUser} courseId={courseId} />
            <div className="content">
                <div className="box">

                    {/* Heading and line after */}
                    <div className="center-items">
                        <h1>Class Invitation</h1>
                        <hr />
                        <div className="invite-message">
                            <p>You have been invited to join</p>
                            <p className="invite-course-title">{state.courseName}</p>
                            <p>as a {state.accountType}</p>
                        </div>

                        <div className="invite-buttons">
                            <Button text="cancel" onSubmit={redirectHome} />
                            <Button text="accept" onSubmit={redirectClass} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invitation;