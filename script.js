// Calculation functions
function calculateBMI(weight, height) {
    const heightM = height / 100; // Convert cm to meters
    return (weight / (heightM * heightM)).toFixed(1);
}

function calculateBMR(age, weight, height, sex) {
    // Mifflin-St Jeor equation
    if (sex === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

function calculateTDEE(bmr, activityLevel) {
    // Activity levels:
    // 1.2 - Sedentary (little or no exercise)
    // 1.375 - Lightly active (light exercise/sports 1-3 days/week)
    // 1.55 - Moderately active (moderate exercise/sports 3-5 days/week)
    // 1.725 - Very active (hard exercise/sports 6-7 days a week)
    // 1.9 - Extra active (very hard exercise/physical job)
    const activityLevels = {
        'sedentary': 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725,
        'extra active': 1.9
    };
    return Math.round(bmr * activityLevels[activityLevel] || bmr * 1.2);
}

function calculateSafeWeightLossDeficit(tdee) {
    // Safe weight loss is 0.5-1 kg per week
    // 7700 kcal = 1 kg of body weight
    // For 0.5 kg/week: 7700/2 = 3850 kcal/week = 550 kcal/day
    return 550;
}

function calculateWeightLossCalories(tdee, weightLoss, timeframe) {
    // Calculate weekly weight loss goal
    const weeklyWeightLoss = weightLoss / timeframe;
    
    // Calculate daily calorie deficit needed
    const dailyDeficit = (weeklyWeightLoss * 7700) / 7;
    
    // Ensure it's not too aggressive
    const safeDeficit = calculateSafeWeightLossDeficit(tdee);
    const finalDeficit = Math.min(dailyDeficit, safeDeficit);
    
    return Math.round(tdee - finalDeficit);
}

// DOM Elements
const calculateBtn = document.getElementById('calculate');
const resultsSection = document.getElementById('results');
const bmiResult = document.getElementById('bmiResult');
const bmrResult = document.getElementById('bmrResult');
const tdeeResult = document.getElementById('tdeeResult');
const safeDeficit = document.getElementById('safeDeficit');
const weightLossCalories = document.getElementById('weightLossCalories');

// Event Listener
calculateBtn.addEventListener('click', () => {
    // Get input values
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const sex = document.getElementById('sex').value;
    const weightLoss = parseFloat(document.getElementById('weightLoss').value);

    // Validate inputs
    if (isNaN(height) || isNaN(weight) || isNaN(age) || isNaN(weightLoss)) {
        alert('Please fill in all fields with valid numbers');
        return;
    }

    // Perform calculations
    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR(age, weight, height, sex);
    const tdee = calculateTDEE(bmr, 'moderately active'); // Default to moderately active
    const safeDeficitValue = calculateSafeWeightLossDeficit(tdee);
    const weightLossCaloriesNeeded = calculateWeightLossCalories(tdee, weightLoss, timeframe);

    // Display results
    resultsSection.style.display = 'grid';
    bmiResult.textContent = bmi;
    bmrResult.textContent = `${bmr} kcal`;
    tdeeResult.textContent = `${tdee} kcal`;
    safeDeficit.textContent = `${safeDeficitValue} kcal/day`;
    weightLossCalories.textContent = `${weightLossCaloriesNeeded} kcal`;
});
