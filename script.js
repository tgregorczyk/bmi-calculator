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
    // Convert activity level from string to number
    const activityMultiplier = parseFloat(activityLevel);
    return Math.round(bmr * activityMultiplier);
}

function calculateSafeWeightLossDeficit(tdee) {
    // Safe weight loss is 0.5-1 kg per week
    // 7700 kcal = 1 kg of body weight
    // For 0.5 kg/week: 7700/2 = 3850 kcal/week = 550 kcal/day
    return 550;
}

function calculateWeightLossCalories(tdee, weightLoss, timeframe) {
    // Validate input values
    if (isNaN(weightLoss) || isNaN(timeframe) || timeframe <= 0) {
        console.log('Invalid input:', { weightLoss, timeframe });
        return null;
    }

    // Calculate weekly weight loss goal
    const weeklyWeightLoss = weightLoss / timeframe;
    
    // Calculate daily calorie deficit needed
    const dailyDeficit = (weeklyWeightLoss * 7700) / 7;
    
    // Ensure it's not too aggressive
    const safeDeficit = calculateSafeWeightLossDeficit(tdee);
    const finalDeficit = Math.min(dailyDeficit, safeDeficit);
    
    // Log intermediate calculations for debugging
    console.log('Weekly Weight Loss:', weeklyWeightLoss);
    console.log('Daily Deficit:', dailyDeficit);
    console.log('Safe Deficit:', safeDeficit);
    console.log('Final Deficit:', finalDeficit);
    
    // Ensure we don't go below minimum safe calories (1200 for women, 1500 for men)
    const minSafeCalories = 1500; // Default minimum safe calories
    const result = Math.round(tdee - finalDeficit);
    
    if (isNaN(result)) {
        console.log('NaN result detected:', { tdee, finalDeficit });
    }
    
    return result >= minSafeCalories ? result : null;
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
    const activityLevel = document.getElementById('activity').value;
    const weightLoss = parseFloat(document.getElementById('weightLoss').value);
    const timeframe = parseFloat(document.getElementById('timeframe').value);

    // Validate inputs
    if (isNaN(height) || isNaN(weight) || isNaN(age) || isNaN(weightLoss)) {
        alert('Please fill in all fields with valid numbers');
        return;
    }

    // Perform calculations
    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR(age, weight, height, sex);
    const tdee = calculateTDEE(bmr, activityLevel);
    const safeDeficitValue = calculateSafeWeightLossDeficit(tdee);
    
    // Log intermediate values for debugging
    console.log('BMI:', bmi);
    console.log('BMR:', bmr);
    console.log('TDEE:', tdee);
    console.log('Safe Deficit:', safeDeficitValue);
    console.log('Weight Loss:', weightLoss);
    console.log('Timeframe:', timeframe);
    
    const weightLossCaloriesNeeded = calculateWeightLossCalories(tdee, weightLoss, timeframe);

    // Display results
    resultsSection.style.display = 'grid';
    bmiResult.textContent = bmi;
    bmrResult.textContent = `${bmr} kcal`;
    tdeeResult.textContent = `${tdee} kcal`;
    safeDeficit.textContent = `${safeDeficitValue} kcal/day`;
    
    // Handle null values for weight loss calories
    if (weightLossCaloriesNeeded === null) {
        weightLossCalories.textContent = 'Please enter valid weight loss goal and timeframe';
    } else {
        weightLossCalories.textContent = `${weightLossCaloriesNeeded} kcal`;
    }
});
