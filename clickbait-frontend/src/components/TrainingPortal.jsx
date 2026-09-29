import React, { useEffect, useState } from 'react';

import {
    Mail,
    BookOpen,
    Send,
    CheckCircle,
    ShieldAlert,
    Sparkles,
    Terminal
} from 'lucide-react';

import {
    getTrainingData,
    sendTrainingInvite
} from '../api/trainingApi';


export default function TrainingPortal({
    logs = []
}) {

    // =========================================================
    // STATE
    // =========================================================

    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    const [sendingEmployee, setSendingEmployee] = useState(null);

    const [sendingAll, setSendingAll] = useState(false);


    // =========================================================
    // LOAD TRAINING DATA FROM BACKEND
    // =========================================================

    const loadTrainingData = async () => {

        try {

            setLoading(true);
            setError('');

            const data = await getTrainingData();

            /*
             * Backend returns:
             *
             * employee_id
             * employee_number
             * name
             * email
             * department
             * simulation_status
             * training_status
             *
             * Convert it into the status names
             * expected by the existing UI.
             */

            const formattedEmployees = data.map((employee) => {

                let status = 'Clicked';


                if (
                    employee.training_status === 'completed'
                ) {

                    status = 'Training Attended';

                } else if (
                    employee.training_status === 'sent'
                ) {

                    status = 'Training Sent';

                }


                return {

                    id: employee.employee_id,

                    employee_id: employee.employee_id,

                    employee_number:
                        employee.employee_number,

                    name:
                        employee.name,

                    email:
                        employee.email,

                    department:
                        employee.department,

                    status:
                        status

                };

            });


            setEmployees(formattedEmployees);

        } catch (err) {

            console.error(
                'Training data loading error:',
                err
            );

            setError(
                err.message ||
                'Unable to load training data.'
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // LOAD WHEN PAGE OPENS
    // =========================================================

    useEffect(() => {

        loadTrainingData();

    }, []);


    // =========================================================
    // SEND TRAINING TO ONE EMPLOYEE
    // =========================================================

    const handleSendTrainingInvite = async (employee) => {

        try {

            setSendingEmployee(
                employee.employee_number
            );

            setError('');


            await sendTrainingInvite(
                employee.employee_number
            );


            // Refresh the database data
            await loadTrainingData();

        } catch (err) {

            console.error(
                'Training invitation error:',
                err
            );

            setError(
                err.message ||
                'Unable to send training invitation.'
            );

        } finally {

            setSendingEmployee(null);

        }

    };


    // =========================================================
    // SEND TRAINING TO ALL PENDING EMPLOYEES
    // =========================================================

    const handleSendAllTrainingInvites = async () => {

        const pendingEmployees =
            employees.filter(
                employee =>
                    employee.status === 'Clicked' ||
                    employee.status === 'Compromised'
            );


        if (pendingEmployees.length === 0) {

            return;

        }


        try {

            setSendingAll(true);

            setError('');


            for (const employee of pendingEmployees) {

                try {

                    await sendTrainingInvite(
                        employee.employee_number
                    );

                } catch (err) {

                    console.error(
                        `Failed to send training to ${employee.name}:`,
                        err
                    );

                }

            }


            // Refresh after all emails
            await loadTrainingData();

        } catch (err) {

            console.error(
                'Bulk training error:',
                err
            );

            setError(
                err.message ||
                'Unable to send training invitations.'
            );

        } finally {

            setSendingAll(false);

        }

    };


    // =========================================================
    // TRAINING STATUS DATA
    // =========================================================

    const phishedTargets =
        employees.filter(employee =>
            [
                'Clicked',
                'Compromised',
                'Training Sent',
                'Training Attended'
            ].includes(employee.status)
        );


    const invitesSentTargets =
        employees.filter(employee =>
            [
                'Training Sent',
                'Training Attended'
            ].includes(employee.status)
        );


    const completedTargets =
        employees.filter(
            employee =>
                employee.status === 'Training Attended'
        );


    const totalPhished =
        phishedTargets.length;


    const totalInvites =
        invitesSentTargets.length;


    const totalCompleted =
        completedTargets.length;


    const completionRate =
        totalPhished > 0
            ? Math.round(
                (totalCompleted / totalPhished) * 100
            )
            : 0;


    const pendingInvitesCount =
        employees.filter(employee =>
            [
                'Clicked',
                'Compromised'
            ].includes(employee.status)
        ).length;


    // =========================================================
    // UI
    // =========================================================

    return (

        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}
        >

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div
                    style={{
                        padding: '12px 16px',
                        borderRadius: '6px',
                        background:
                            'rgba(239, 68, 68, 0.10)',
                        border:
                            '1px solid rgba(239, 68, 68, 0.30)',
                        color:
                            'var(--danger-accent)',
                        fontSize: '13px'
                    }}
                >
                    {error}
                </div>

            )}


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="dashboard-grid">

                {/* Vulnerable Targets */}

                <div className="kpi-card clicked">

                    <div className="kpi-header">

                        <span className="kpi-title">
                            Vulnerable Targets
                        </span>

                        <ShieldAlert
                            className="kpi-icon"
                            size={20}
                            style={{
                                color:
                                    'var(--danger-accent)'
                            }}
                        />

                    </div>


                    <div
                        className="kpi-value"
                        style={{
                            color:
                                'var(--danger-accent)'
                        }}
                    >
                        {loading
                            ? '—'
                            : totalPhished
                        }
                    </div>


                    <div className="kpi-subtext">

                        <span>
                            Fell for the phishing simulation link
                        </span>

                    </div>

                </div>


                {/* Training Invites */}

                <div className="kpi-card compromised">

                    <div className="kpi-header">

                        <span className="kpi-title">
                            Training Invites Dispatched
                        </span>

                        <Mail
                            className="kpi-icon"
                            size={20}
                            style={{
                                color:
                                    'var(--primary-accent)'
                            }}
                        />

                    </div>


                    <div
                        className="kpi-value"
                        style={{
                            color:
                                'var(--text-accent)'
                        }}
                    >
                        {loading
                            ? '—'
                            : totalInvites
                        }
                    </div>


                    <div className="kpi-subtext">

                        <span>
                            {pendingInvitesCount}
                            {' '}
                            targets awaiting invitations
                        </span>

                    </div>

                </div>


                {/* Completed */}

                <div className="kpi-card training">

                    <div className="kpi-header">

                        <span className="kpi-title">
                            Remediation Completed
                        </span>

                        <BookOpen
                            className="kpi-icon"
                            size={20}
                            style={{
                                color:
                                    'var(--success-accent)'
                            }}
                        />

                    </div>


                    <div
                        className="kpi-value"
                        style={{
                            color:
                                'var(--success-accent)'
                        }}
                    >
                        {loading
                            ? '—'
                            : totalCompleted
                        }
                    </div>


                    <div className="kpi-subtext">

                        <span
                            style={{
                                color:
                                    'var(--success-accent)',
                                fontWeight: '500'
                            }}
                        >
                            {completionRate}%
                            {' '}
                            Attendance Rate
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                PROGRESS & AUTOMATION BAR
            ================================================= */}

            <div className="training-progress-container">

                <div className="training-progress-info">

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '13px',
                            fontWeight: '500',
                            marginBottom: '8px'
                        }}
                    >

                        <span
                            style={{
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Security Awareness Progress
                        </span>


                        <span
                            style={{
                                color:
                                    'var(--success-accent)'
                            }}
                        >
                            {totalCompleted}
                            {' '}
                            of
                            {' '}
                            {totalPhished}
                            {' '}
                            Attended
                        </span>

                    </div>


                    <div className="progress-bar-bg">

                        <div
                            className="progress-bar-fill"
                            style={{
                                width:
                                    `${completionRate}%`
                            }}
                        />

                    </div>

                </div>


                <div>

                    <button
                        disabled={
                            pendingInvitesCount === 0 ||
                            sendingAll
                        }
                        onClick={
                            handleSendAllTrainingInvites
                        }
                        className="btn btn-accent"
                        style={{
                            opacity:
                                pendingInvitesCount === 0 ||
                                sendingAll
                                    ? 0.5
                                    : 1,

                            cursor:
                                pendingInvitesCount === 0 ||
                                sendingAll
                                    ? 'not-allowed'
                                    : 'pointer'
                        }}
                    >

                        <Sparkles size={16} />

                        {sendingAll
                            ? 'Sending Invitations...'
                            : `Automate Remediation Invitations (${pendingInvitesCount})`
                        }

                    </button>

                </div>

            </div>


            {/* =================================================
                MAIN LAYOUT
            ================================================= */}

            <div
                className="charts-grid"
                style={{
                    gridTemplateColumns: '2fr 1fr'
                }}
            >

                {/* =================================================
                    TRAINING ROSTER
                ================================================= */}

                <div
                    className="directory-section"
                    style={{
                        border:
                            '1px solid var(--border)'
                    }}
                >

                    <h3
                        className="chart-title"
                        style={{
                            borderBottom:
                                '1px solid var(--border)',

                            paddingBottom:
                                '12px',

                            margin: 0,

                            marginBottom:
                                '16px'
                        }}
                    >

                        <BookOpen
                            size={16}
                            style={{
                                marginRight: '6px',
                                color:
                                    'var(--primary-accent)'
                            }}
                        />

                        Training Roster

                    </h3>


                    <div className="table-wrapper">

                        <table className="employee-table">

                            <thead>

                                <tr>

                                    <th>
                                        Recipient Details
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Simulation Result
                                    </th>

                                    <th>
                                        Training Stage
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                'right'
                                        }}
                                    >
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign:
                                                    'center',
                                                padding:
                                                    '36px',
                                                color:
                                                    'var(--text-muted)'
                                            }}
                                        >
                                            Loading training data...
                                        </td>

                                    </tr>

                                ) : phishedTargets.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign:
                                                    'center',
                                                padding:
                                                    '36px',
                                                color:
                                                    'var(--text-muted)'
                                            }}
                                        >
                                            No employees have
                                            tripped phishing
                                            sensors yet.
                                        </td>

                                    </tr>

                                ) : (

                                    phishedTargets.map(
                                        emp => (

                                            <tr
                                                key={
                                                    emp.id
                                                }
                                            >

                                                {/* Employee */}

                                                <td>

                                                    <div
                                                        className="emp-name-cell"
                                                    >

                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    '600'
                                                            }}
                                                        >
                                                            {emp.name}
                                                        </span>

                                                        <span
                                                            className="emp-email"
                                                        >
                                                            {emp.email}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* Department */}

                                                <td>

                                                    <span
                                                        className="department-badge"
                                                    >
                                                        {emp.department}
                                                    </span>

                                                </td>


                                                {/* Simulation */}

                                                <td>

                                                    <span
                                                        className="status-badge clicked"
                                                        style={{
                                                            backgroundColor:
                                                                emp.status ===
                                                                'Compromised'
                                                                    ? 'rgba(239, 68, 68, 0.1)'
                                                                    : 'rgba(245, 158, 11, 0.1)',

                                                            borderColor:
                                                                emp.status ===
                                                                'Compromised'
                                                                    ? 'rgba(239, 68, 68, 0.4)'
                                                                    : 'rgba(245, 158, 11, 0.4)',

                                                            color:
                                                                emp.status ===
                                                                'Compromised'
                                                                    ? 'var(--danger-accent)'
                                                                    : 'var(--warning-accent)'
                                                        }}
                                                    >

                                                        {emp.status ===
                                                        'Compromised'
                                                            ? 'Submitted Creds'
                                                            : 'Clicked Link'
                                                        }

                                                    </span>

                                                </td>


                                                {/* Training Stage */}

                                                <td>

                                                    {emp.status ===
                                                    'Clicked' ||
                                                    emp.status ===
                                                    'Compromised' ? (

                                                        <span
                                                            className="status-badge pending"
                                                        >
                                                            Awaiting Dispatch
                                                        </span>

                                                    ) : emp.status ===
                                                    'Training Sent' ? (

                                                        <span
                                                            className="status-badge training-sent"
                                                        >
                                                            Invite Dispatched
                                                        </span>

                                                    ) : (

                                                        <span
                                                            className="status-badge training-attended"
                                                        >

                                                            <CheckCircle
                                                                size={10}
                                                                style={{
                                                                    display:
                                                                        'inline',
                                                                    marginRight:
                                                                        '4px'
                                                                }}
                                                            />

                                                            Completed

                                                        </span>

                                                    )}

                                                </td>


                                                {/* Actions */}

                                                <td>

                                                    <div
                                                        className="cell-actions"
                                                    >

                                                        {(
                                                            emp.status ===
                                                            'Clicked' ||
                                                            emp.status ===
                                                            'Compromised'
                                                        ) && (

                                                            <button
                                                                disabled={
                                                                    sendingEmployee ===
                                                                    emp.employee_number
                                                                }
                                                                onClick={() =>
                                                                    handleSendTrainingInvite(
                                                                        emp
                                                                    )
                                                                }
                                                                className="btn btn-primary btn-sm"
                                                                style={{
                                                                    opacity:
                                                                        sendingEmployee ===
                                                                        emp.employee_number
                                                                            ? 0.5
                                                                            : 1,

                                                                    cursor:
                                                                        sendingEmployee ===
                                                                        emp.employee_number
                                                                            ? 'not-allowed'
                                                                            : 'pointer'
                                                                }}
                                                            >

                                                                <Send
                                                                    size={11}
                                                                />

                                                                {sendingEmployee ===
                                                                emp.employee_number
                                                                    ? ' Sending...'
                                                                    : ' Send Invite'
                                                                }

                                                            </button>

                                                        )}


                                                        {emp.status ===
                                                        'Training Sent' && (

                                                            <button
                                                                disabled={
                                                                    sendingEmployee ===
                                                                    emp.employee_number
                                                                }
                                                                onClick={() =>
                                                                    handleSendTrainingInvite(
                                                                        emp
                                                                    )
                                                                }
                                                                className="btn btn-primary btn-sm"
                                                                style={{
                                                                    opacity:
                                                                        sendingEmployee ===
                                                                        emp.employee_number
                                                                            ? 0.5
                                                                            : 1,

                                                                    cursor:
                                                                        sendingEmployee ===
                                                                        emp.employee_number
                                                                            ? 'not-allowed'
                                                                            : 'pointer'
                                                                }}
                                                            >

                                                                <Send
                                                                    size={11}
                                                                />

                                                                {sendingEmployee ===
                                                                emp.employee_number
                                                                    ? ' Sending...'
                                                                    : ' Resend Invite'
                                                                }

                                                            </button>

                                                        )}


                                                        {emp.status ===
                                                        'Training Attended' && (

                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                    color:
                                                                        'var(--success-accent)',
                                                                    fontWeight:
                                                                        '500'
                                                                }}
                                                            >
                                                                Completed ✅
                                                            </span>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* =================================================
                    ACTIVITY LOG
                ================================================= */}

                <div
                    className="chart-card"
                    style={{
                        display:
                            'flex',
                        flexDirection:
                            'column'
                    }}
                >

                    <h3 className="chart-title">

                        <Terminal size={16} />

                        Campaign Activity Log

                    </h3>


                    <div
                        style={{
                            fontSize: '12px',
                            color:
                                'var(--text-muted)',
                            marginBottom:
                                '12px'
                        }}
                    >
                        Real-time event stream
                    </div>


                    <div
                        className="console-log-box"
                        style={{
                            flexGrow: 1,
                            minHeight: '240px'
                        }}
                    >

                        {logs.length === 0 ? (

                            <div
                                style={{
                                    color:
                                        'var(--text-muted)'
                                }}
                            >
                                No recent activity logged
                            </div>

                        ) : (

                            logs.map(
                                (log, idx) => (

                                    <div
                                        key={idx}
                                        className="console-line"
                                    >

                                        <span
                                            className="console-timestamp"
                                        >
                                            [{log.time}]
                                        </span>

                                        <span>
                                            {log.text}
                                        </span>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}