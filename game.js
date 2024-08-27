import chalk from "chalk";
import readlineSync from "readline-sync";

class Player {
  constructor() {
    this.name = "피카츄";
    this.level = 1;
    this.baseHp = 100; // 기본 체력
    this.hp = this.baseHp; // 현재 체력
    this.damage = 30;
    this.isEvolved = false; // 진화 여부 확인
    this.acc = {
      quickAttack: 100,
      thunderShock: 80,
      spark: 70,
      thunderBolt: 50,
    };
  }

  lvUp() {
    this.level += 1;
    this.damage = 30 + this.level * 5;
    this.baseHp = 100 * 1.5 * this.level; // 레벨에 따른 기본체력 증가
    this.hp = this.baseHp; // 렙업시 체력충전
  }

  attackWithAccuracy(skillName, monster, damageMultiplier) {
    const hitChance = this.acc[skillName];
    const randomChance = Math.round(Math.random() * 100);

    if (randomChance <= hitChance) {
      monster.hp -= this.damage * damageMultiplier;
      return true; // 공격 성공
    } else {
      return false; // 공격 실패
    }
  }

  quickAttack(monster) {
    return this.attackWithAccuracy("quickAttack", monster, 10000);
  }

  thunderShock(monster) {
    return this.attackWithAccuracy("thunderShock", monster, 2);
  }

  spark(monster) {
    return this.attackWithAccuracy("spark", monster, 3);
  }

  thunderBolt(monster) {
    return this.attackWithAccuracy("thunderBolt", monster, 5);
  }

  run() {
    return 50 >= Math.round(Math.random() * 100);
  }
}

class Monster {
  constructor(stage) {
    const monsterNames = [
      "우츠동",
      "모부기",
      "덩쿠리",
      "이상해씨",
      "체리버",
      "냄새꼬",
      "세레비",
      "쉐이미",
      "나무지기",
    ];
    this.name = monsterNames[Math.floor(Math.random() * monsterNames.length)]; // 랜덤 몬스터 이름 선택
    this.hp = 100 * stage;
    this.damage = 10 * stage;
    this.skills = {
      tackle: { name: "몸통박치기", damageMultiplier: 1, accuracy: 95 },
      leafCutter: { name: "잎날가르기", damageMultiplier: 2, accuracy: 85 },
      vineWhip: { name: "풀묶기", damageMultiplier: 3, accuracy: 70 },
      solarBeam: { name: "솔라빔", damageMultiplier: 5, accuracy: 50 },
    };
  }

  // 명중률 계산
  attackWithAccuracy(skill, player) {
    const hitChance = skill.accuracy;
    const randomChance = Math.round(Math.random() * 100);

    if (randomChance <= hitChance) {
      player.hp -= this.damage * skill.damageMultiplier;
      return {
        success: true,
        skillName: skill.name,
        damage: this.damage * skill.damageMultiplier,
      };
    } else {
      return { success: false, skillName: skill.name };
    }
  }

  // 몬스터가 랜덤 스킬로 공격
  attack(player) {
    const skillNames = Object.keys(this.skills);
    const randomSkill =
      this.skills[skillNames[Math.floor(Math.random() * skillNames.length)]];
    return this.attackWithAccuracy(randomSkill, player);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(
        `| ${player.name}의 HP : ${player.hp}, Level : ${player.level}`
      ) +
      chalk.redBright(
        `| ${monster.name}의 HP : ${monster.hp}, 공격력 : ${monster.damage} |`
      )
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 전광석화(${player.damage}) 2. 전기쇼크(${player.damage * 2}) 3. 스파크(${player.damage * 3}) 4. 10만볼트(${player.damage * 4}) 5. 도망간다!`
      )
    );
    const choice = readlineSync.question("당신의 선택은? ");

    let attackSuccessful = false;
    let vaildChoice = true;
    switch (choice) {
      case "1":
        logs.push(chalk.green(`가랏! ${player.name}! 전광석화!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackSuccessful = player.quickAttack(monster);
        break;
      case "2":
        logs.push(chalk.green(`가랏! ${player.name}! 전기쇼크!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackSuccessful = player.thunderShock(monster);
        break;
      case "3":
        logs.push(chalk.green(`가랏! ${player.name}! 스파크!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackSuccessful = player.spark(monster);
        break;
      case "4":
        logs.push(chalk.green(`가랏! ${player.name}! 10만볼트!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackSuccessful = player.thunderBolt(monster);
        break;
      case "5":
        logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

        if (player.run() === true) {
          console.log(chalk.white("무사히 도망쳤다!"));
          await delay(1000);
          return true; // 도망 성공 시 true 반환
        } else {
          logs.push(chalk.white("도망칠 수 없다!"));
          console.log(logs[logs.length - 1]);
          vaildChoice = false;
        }
      default:
        logs.push(chalk.red("잘못된 선택입니다."));
        vaildChoice = false;
    }

    if (vaildChoice && choice !== "5") {
      await delay(500);
      if (attackSuccessful) {
        logs.push(chalk.white(`${player.name}의 공격이 명중했습니다!`));
      } else {
        logs.push(chalk.red(`${player.name}의 공격이 빗나갔습니다...`));
      }
    }
    const monsterAttack = monster.attack(player);
    await delay(500);
    if (monsterAttack.success) {
      logs.push(
        chalk.red(
          `야생의 ${monster.name}이(가) ${monsterAttack.skillName}를 사용했다! ${monsterAttack.damage}의 피해를 입었다!`
        )
      );
    } else {
      logs.push(
        chalk.red(
          `야생의 ${monster.name}이(가) ${monsterAttack.skillName}를 사용했지만 빗나갔다!`
        )
      );
    }
    // 공격 후 상태 출력
    logs.push(chalk.blueBright(`${player.name}의 남은 체력: ${player.hp}`));
    logs.push(chalk.redBright(`${monster.name}의 남은 체력: ${monster.hp}`));
  }
  // 게임중 죽었다면
  if (player.hp <= 0) {
    console.clear();
    console.log(chalk.red(`${player.name}은(는) 죽었습니다...`));
    console.log(chalk.yellow("게임을 재시작하려면 1을 누르세요."));
    console.log(chalk.yellow("게임을 포기하려면 2를 누르세요."));
    const choice = readlineSync.question("당신의 선택은? ");

    if (choice === "1") {
      console.log(chalk.green("게임을 재시작합니다..."));
      return true; // 재시작 선택 시 true 반환
    } else {
      console.log(chalk.green("게임을 종료합니다. 감사합니다!"));
      return false; // 포기 선택 시 false 반환
    }
  }

  return false; // 배틀이 끝난 후 도망치지 않았다면 false 반환
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10 && player.hp > 0) {
    const monster = new Monster(stage);

    const runAway = await battle(stage, player, monster);

    if (!runAway) {
      console.log(chalk.blue(`야생의 ${monster.name}이(가) 쓰러졌다!`));
      await delay(500);

      player.lvUp();
      console.log(
        chalk.yellow(`레벨이 1 올랐습니다! 현재 레벨: ${player.level}`)
      );
      console.log(
        chalk.yellow(`체력이 충전 되었습니다! 현재 체력: ${player.hp}`)
      );
      await delay(1500);

      // 진화 체크 및 진화 메시지 출력
      if (player.level === 5 && !player.isEvolved) {
        await delay(1000);
        console.log("어?... 피카츄의 상태가...?");
        await delay(500);
        console.log("...");
        await delay(500);
        console.log("...");
        await delay(500);
        console.log("...");
        await delay(1000);
        console.log(
          chalk.yellow("축하합니다! 피카츄는 라이츄로 진화했습니다!!")
        );
        player.name = "라이츄";
        player.isEvolved = true;
        await delay(2500);
      }
    }

    // 게임 클리어 시
    if (stage < 10) {
      // 새로운 스테이지 메시지
      console.clear();
      console.log(chalk.red(`야생의 몬스터가 나타났다!`));
      await delay(1500);
      stage++;
    } else {
      // 게임 클리어시
      console.clear();
      console.log(chalk.green("축하합니다! 스테이지 10을 클리어했습니다!"));
      console.log(chalk.yellow("게임이 클리어 되었습니다!"));
      await delay(3000);
      break; // 게임 종료
    }
  }
}
