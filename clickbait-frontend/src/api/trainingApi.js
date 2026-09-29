const API_BASE_URL = 'http://127.0.0.1:8000';


// Get employees who need training
export async function getTrainingData() {

    const response = await fetch(
        `${API_BASE_URL}/training`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || 'Failed to load training data'
        );
    }

    return data;
}


// Send training email to one employee
export async function sendTrainingInvite(employeeNumber) {

    const response = await fetch(
        `${API_BASE_URL}/send-training/${employeeNumber}`,
        {
            method: 'POST'
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || 'Failed to send training invitation'
        );
    }

    return data;
}