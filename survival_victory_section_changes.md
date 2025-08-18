execute the following tasks:
do not make any changes that are not listed here specifically.
make sure every change you make doesnt break anything related or unrelated to your tasks.
Your should update yourself the Task State to one of the following - not started yet, in progress, completed, need clarification, need more information, or failed.
when working on a task, Do Recon First: Open and read the exact files involved before changing anything; search within files for target state/props to avoid guesswork.
you're not allowed to change the task completion as i do it myself manually after you mark a task as completed to ensure its actually completed, you can only update the task state. 
tasks should be completed in the order they are listed.

# Changes to the survival mode’s victory section:

1. Fix the GIF to be displayed correctly  
   - Task state [updated by AI]: not started yet  
   - Task completion [only updated by User]:  

2. Change the UI of the total score and score gained from this round. It should be like this:
hierarchy - total score is bigger and above the score gained from this round 

Animation - the total score should have smooth animation of the number rising from the previous total score (before this round) to the total score after this round. For example, if on the first round user gains 200 points, it should animate from 0 (starting score) to 200. If on the second round he gains 150 points, the total score should animate from 200 (previous total score) to 350 (total score now). Animation is simple animation of the number adding 1 rapidly until reached the right amount. The animation should be static, but rather have a curve where it decays - that means if we use the example, let’s say 200 to 350, it should rise at most speed at first and slowly decay until it reaches 350. The total time of the animation should be between 2-3 seconds  
   - Task state [updated by AI]: not started yet  
   - Task completion [only updated by User]:  

3. Below the score gained from this round, there should be 3 small bullets that displays why user got this score
It should be like this 

• base amount - {base score gained per round, static}
• ⁠guesses left - {bonus points gained based on how many guesses left. Bonus points calculated based on:
the maximum amount of bonus points (the maximum amount that can be gained, this maximum is achievable if user guesses on the first try) minus the guesses user used before guessing the right answer. 
• time left - {calculated based on maximum points that can be gained through time, which is static, minus the time passed until user guessed the right answer}  
   - Task state [updated by AI]: not started yet  
   - Task completion [only updated by User]:  

4. the brawler that was guessed is currently appear by name. delete the name, instead display portrait image of the brawler. (this is referring to the brawler that was guessed correctly in that round. for example, if user plays gadget mode on survival and the correct brawler is Spike, when he guesses spike in the victory screen there should be a portrait image of spike instead of currently the text "Spike")  
   - Task state [updated by AI]: not started yet  
   - Task completion [only updated by User]:  
