// Calculation functions
const BMI_CATEGORIES = [
    { min: null, max: 15.9, category: "Severely underweight" },
    { min: 16.0, max: 16.9, category: "Moderately underweight" },
    { min: 17.0, max: 18.4, category: "Mildly underweight" },
    { min: 18.5, max: 24.9, category: "Normal weight" },
    { min: 25.0, max: 29.9, category: "Overweight" },
    { min: 30.0, max: 34.9, category: "Obesity class I (mild)" },
    { min: 35.0, max: 39.9, category: "Obesity class II (moderate)" },
    { min: 40.0, max: null, category: "Obesity class III (severe)" }
];

function calculateBMI(weight, height) {
    const heightM = height / 100; // Convert cm to meters
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    return {
        value: bmi,
        category: getBMICategory(bmi)
    };
}

function getBMICategory(bmi) {
    const bmiValue = parseFloat(bmi);
    for (let category of BMI_CATEGORIES) {
        if ((category.min === null || bmiValue >= category.min) &&
            (category.max === null || bmiValue <= category.max)) {
            return category.category;
        }
    }
    return "Unknown category";
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

const minSafeCalories = 1500; // Default minimum safe calories

function calculateWeightLossCalories(tdee, weightLoss, timeframe) {
    // Validate all input values
    if (isNaN(tdee) || isNaN(weightLoss) || isNaN(timeframe) || timeframe <= 0) {
        console.log('Invalid input:', { tdee, weightLoss, timeframe });
        return { value: null, reason: 'invalid_input' };
    }

    // Ensure all values are positive numbers
    tdee = Math.max(0, tdee);
    weightLoss = Math.max(0, weightLoss);
    timeframe = Math.max(1, timeframe);

    // Calculate weekly weight loss goal
    const weeklyWeightLoss = weightLoss / timeframe;
    
    // Calculate daily calorie deficit needed
    const dailyDeficit = (weeklyWeightLoss * 7700) / 7;
    
    // Ensure it's not too aggressive
    const safeDeficit = calculateSafeWeightLossDeficit(tdee);
    const finalDeficit = Math.min(dailyDeficit, safeDeficit);
    
    // Calculate final calories
    const result = Math.max(0, tdee - finalDeficit);
    
    // Log intermediate calculations for debugging
    console.log('TDEE:', tdee);
    console.log('Weight Loss:', weightLoss);
    console.log('Timeframe:', timeframe);
    console.log('Weekly Weight Loss:', weeklyWeightLoss);
    console.log('Daily Deficit:', dailyDeficit);
    console.log('Safe Deficit:', safeDeficit);
    console.log('Final Deficit:', finalDeficit);
    console.log('Result:', result);

    // Ensure we don't go below minimum safe calories
    if (result < minSafeCalories) {
        console.log('Result below minimum safe calories:', result, minSafeCalories);
        return { value: null, reason: 'below_minimum', calculated: Math.round(result) };
    }
    
    return { value: Math.round(result), reason: null };
}

document.addEventListener('DOMContentLoaded', () => {
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
    const activity = document.getElementById('activity').value;
    const weightLoss = parseFloat(document.getElementById('weightLoss').value);
    const timeframe = parseFloat(document.getElementById('timeframe').value);

    // Validate inputs
    if (!height || !weight || !age || !sex || !activity || !weightLoss || !timeframe) {
        return;
    }

    // Perform calculations
    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR(age, weight, height, sex);
    const tdee = calculateTDEE(bmr, activity);
    const safeDeficitValue = calculateSafeWeightLossDeficit(tdee);
    
    // Log intermediate values for debugging
    console.log('BMI:', bmi);
    console.log('BMR:', bmr);
    console.log('TDEE:', tdee);
    console.log('Safe Deficit:', safeDeficitValue);
    console.log('Weight Loss:', weightLoss);
    console.log('Timeframe:', timeframe);
    
    const weightLossCaloriesResult = calculateWeightLossCalories(tdee, weightLoss, timeframe);

    // Display results
    resultsSection.style.display = 'grid';
    const { value: bmiValue, category: bmiCategory } = bmi;
    bmiResult.textContent = `${bmiValue} (${bmiCategory})`;
    bmrResult.textContent = `${bmr} kcal`;
    tdeeResult.textContent = `${tdee} kcal`;
    safeDeficit.textContent = `${safeDeficitValue} kcal/day`;
    
    // Show diet proposal modal after displaying results
    showDietModal();

    // Handle null values for weight loss calories
    if (weightLossCaloriesResult.value === null) {
        if (weightLossCaloriesResult.reason === 'below_minimum') {
            // Show the calculated value with warning if possible, otherwise show a generic warning
            if (typeof weightLossCaloriesResult.calculated === 'number') {
                weightLossCalories.innerHTML = `<span style=\"color: red; font-weight: bold;\">${weightLossCaloriesResult.calculated} kcal</span><br><span style=\"color: red; font-size: 0.75em;\">(Warning: below recommended safe minimum of 1500 kcal/day)</span>`;
            } else {
                weightLossCalories.innerHTML = `<span style=\"color: red;\">Recommended calories would be below the safe minimum (1500 kcal/day).</span>`;
            }
        } else {
            weightLossCalories.textContent = 'Please enter valid weight loss goal and timeframe';
        }
    } else if (weightLossCaloriesResult.value < minSafeCalories) {
        weightLossCalories.innerHTML = `<span style=\"color: red; font-weight: bold;\">${weightLossCaloriesResult.value} kcal</span><br><span style=\"color: red; font-size: 0.75em;\">(Warning: below recommended safe minimum of 1500 kcal/day)</span>`;
    } else {
        weightLossCalories.textContent = `${weightLossCaloriesResult.value} kcal`;
    }
  });
});
