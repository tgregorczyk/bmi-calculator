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
    const dietPlanSection = document.getElementById('dietPlan');

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
    dietPlanSection.style.display = 'none'; // Hide diet plan initially
    const { value: bmiValue, category: bmiCategory } = bmi;
    bmiResult.textContent = `${bmiValue} (${bmiCategory})`;
    bmrResult.textContent = `${bmr} kcal`;
    tdeeResult.textContent = `${tdee} kcal`;
    safeDeficit.textContent = `${safeDeficitValue} kcal/day`;
    
    // Handle weight loss calories display with warning for values below minSafeCalories
    if (weightLossCaloriesResult.value === null) {
        if (weightLossCaloriesResult.reason === 'below_minimum' && typeof weightLossCaloriesResult.calculated === 'number') {
            // Show the calculated value with warning in red
            weightLossCalories.innerHTML = `
                <span style="color: red; font-weight: bold;">${weightLossCaloriesResult.calculated} kcal</span>
                <br>
                <span style="color: red; font-size: 0.75em;">(Warning: below recommended safe minimum of 1500 kcal/day)</span>
            `;
        } else {
            weightLossCalories.textContent = 'Please enter valid weight loss goal and timeframe';
        }
    } else {
        // If we have a value but it's below the safe minimum, show it with a warning
        if (weightLossCaloriesResult.value < minSafeCalories) {
            weightLossCalories.innerHTML = `
                <span style="color: red; font-weight: bold;">${weightLossCaloriesResult.value} kcal</span>
                <br>
                <span style="color: red; font-size: 0.75em;">(Warning: below recommended safe minimum of 1500 kcal/day)</span>
            `;
        } else {
            weightLossCalories.textContent = `${weightLossCaloriesResult.value} kcal`;
        }
    }
    
        // Generate and display diet plan
    generateDietPlan(weightLossCaloriesResult.value || weightLossCaloriesResult.calculated || 0);
  });
});

// Diet plan generation
function generateDietPlan(totalCalories) {
  // Define food options with calorie counts
  const foodOptions = {
    breakfast: [
      { name: 'Oatmeal with banana and honey', calories: 300 },
      { name: 'Greek yogurt with berries and granola', calories: 350 },
      { name: 'Scrambled eggs with whole wheat toast', calories: 400 },
      { name: 'Smoothie bowl with fruits and nuts', calories: 380 },
      { name: 'Avocado toast with poached eggs', calories: 420 }
    ],
    lunch: [
      { name: 'Grilled chicken salad with vinaigrette', calories: 450 },
      { name: 'Quinoa bowl with roasted vegetables', calories: 400 },
      { name: 'Turkey and avocado wrap', calories: 480 },
      { name: 'Lentil soup with whole grain bread', calories: 380 },
      { name: 'Grilled salmon with sweet potato', calories: 500 }
    ],
    dinner: [
      { name: 'Grilled fish with steamed vegetables', calories: 450 },
      { name: 'Stir-fried tofu with brown rice', calories: 400 },
      { name: 'Baked chicken with quinoa and greens', calories: 480 },
      { name: 'Vegetable curry with basmati rice', calories: 420 },
      { name: 'Lean beef with mashed cauliflower', calories: 500 }
    ]
  };

  // Calculate target calories per meal (40% breakfast, 30% lunch, 30% dinner)
  const targetBreakfast = Math.round(totalCalories * 0.35);
  const targetLunch = Math.round(totalCalories * 0.4);
  const targetDinner = Math.round(totalCalories * 0.25);

  // Find closest matching meals
  const breakfast = findClosestMeal(foodOptions.breakfast, targetBreakfast);
  const lunch = findClosestMeal(foodOptions.lunch, targetLunch);
  const dinner = findClosestMeal(foodOptions.dinner, targetDinner);

  // Update the DOM
  document.getElementById('breakfast').textContent = breakfast.name;
  document.getElementById('breakfastCalories').textContent = `${breakfast.calories} kcal`;
  
  document.getElementById('lunch').textContent = lunch.name;
  document.getElementById('lunchCalories').textContent = `${lunch.calories} kcal`;
  
  document.getElementById('dinner').textContent = dinner.name;
  document.getElementById('dinnerCalories').textContent = `${dinner.calories} kcal`;
  
  const totalPlanCalories = breakfast.calories + lunch.calories + dinner.calories;
  document.getElementById('totalCalories').textContent = totalPlanCalories;
  
  // Show the diet plan section
  document.getElementById('dietPlan').style.display = 'block';
}

function findClosestMeal(meals, targetCalories) {
  return meals.reduce((prev, curr) => 
    Math.abs(curr.calories - targetCalories) < Math.abs(prev.calories - targetCalories) 
      ? curr 
      : prev
  );
}
