function check_power (human) {
    if (human.age < 12 || human.pregnant == true) return 0;
    else if (human.gender == 0 && human.age > 20) return 9;
    else if (human.gender == 1 && human.age > 20 && human.age < 24) return 15;
    else if (human.gender == 1 && human.age >= 24) return 20;
    else return 10;
}
function new_human (gender = 0, age = 0, gap = 2) {
    return {
        gender: gender, // 0: female, 1: male
        age: age,
        pregnant: false,
        gap: gap // two years gap is necessary to have be pregnant again; 
    }
}
function generate_tribal(team, num, gender_func) {
    let res = [];
    for (let i = 1; i <= num; i++) {
        res.push(new_human(gender_func(), 18, Math.round(Math.random() * 2)));
    }
    return {
        team: team,
        people: res,
        gender_func: gender_func,
        combat_power: 0,
        female: 0,
        male: 0,
        kid:0,
        add:0,
        update: function() {
            let possibility = 0.001;
            this.combat_power = 0;
            this.female = 0;
            this.male = 0;
            this.kid = 0;
            this.add = 0;
            if (this.people.length > 500) possibility = 0.006;
            if (this.people.length > 2000) possibility = 0.014;
            if (this.people.length > 5000) possibility = 0.030;
            // random die possibilty base
            for (let i = 0; i < this.people.length; i++) {
                if (Math.random() < possibility + 1.0015 ** this.people[i].age - 1) {
                    this.people.splice(i--, 1);
                    continue;  // randomly die
                } 
                this.people[i].age++; this.people[i].gap++;
                if (this.people[i].pregnant) {
                    this.people[i].pregnant = false;
                    this.people[i].gap = 0;
                    if (Math.random() < 0.5) this.people.push(new_human(this.gender_func(this.people.length))); // 50%可能流产
                }
                if (this.people[i].gap >= 2 && this.people[i].gender == 0 && this.people[i].age >= 18) {
                    this.people[i].pregnant = true;
                    this.add++;
                }
                if (this.people[i].gender == 1 && this.people[i].age >= 18) this.male++;
                if (this.people[i].gender == 0 && this.people[i].age >= 18) this.female++;
                if (this.people[i].age < 18) this.kid++;
                
                this.combat_power += check_power(this.people[i]);
            }
        }
    }
}

let year = 0; // strat year

let team = [];
for (let i = 1; i <= 5; i++) {
    team.push(generate_tribal(1, 50, () => Math.random() < 0.5 ? 0 : 1 )); // Traditional
    team.push(generate_tribal(2, 49, () => 0)); // Pure female
    team.push(generate_tribal(3, 49, (length = 0) => {
        if (length < 2000) return 0;
        else return (Math.random() < 0.5 ? 0 : 1 );
    })); // Mixed
}


function main_loop() {
    console.log(`Year ${year++}`);
    // growth
    for (const i in team) {
        team[i].update();
        console.log(`Tribal${i} of team${team[i].team}: combat_power: ${team[i].combat_power} toadd:${team[i].add} people:${team[i].people.length} kid:${String(team[i].kid / team[i].people.length * 100).slice(0,4)}% female:${String(team[i].female / team[i].people.length * 100).slice(0,4)}% male:${String(team[i].male / team[i].people.length * 100).slice(0,4)}%`)
    }

    // randomly fight
    for (let i = 0; i < team.length; i++) {
        
        if (Math.random() < 0.1) {
            let j = Math.round(Math.random() * team.length - 0.5);
            if (j == i) continue;
            
            if (team[i].combat_power / team[j].combat_power > 2) { // 实力差距悬殊
                console.log(`Tribal${i} of team${team[i].team} fight to Tribal${j} of team${team[j].team} and win!`)

                // kill loser's half
                for (let iter = 0; iter < team[j].people.length; iter++) {
                    if (team[j].people[iter].gender == 1 || (check_power(team[j].people[iter]) != 0 && Math.random() < 0.5) ) {
                        team[j].people.splice(iter--, 1);
                    }
                }
                // kill winner's
                let total = team[j].combat_power;
                for (let iter = 0; iter < team[i].people.length; iter++) {
                    if (check_power(team[i].people[iter]) != 0 ) {
                        total -= check_power(team[i].people.splice(iter--, 1));
                    }
                }

                for (let person of team[j].people) team[i].people.push(person);
                
                // delete the tribal
                team.splice(j,1);

            } else if (team[i].combat_power / team[j].combat_power > 1.5) { // 实力差距不悬殊
                console.log(`Tribal${i} of team${team[i].team} fight to Tribal${j} of team${team[j].team}`)
                let total = 0;
                // kill loser's half
                for (let iter = 0; iter < team[j].people.length; iter++) {
                    if ((check_power(team[j].people[iter]) != 0 && Math.random() < 0.5) ) {
                        total += check_power(team[j].people.splice(iter--, 1)[0]);
                    }
                }
                // kill winner's
                for (let iter = 0; iter < team[i].people.length; iter++) {
                    if (check_power(team[i].people[iter]) != 0 && total > 0) {
                        total -= check_power(team[i].people.splice(iter--, 1)[0]);
                    }
                }

            }

            
        }
    }
}

setInterval(() => {
    main_loop();
}, 250);