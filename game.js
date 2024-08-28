import chalk from "chalk";
import readlineSync from "readline-sync";

// 피카츄
class Player {
  constructor() {
    this.name = "피카츄";
    this.level = 1;
    this.baseHp = 100; // 기본 체력
    this.hp = this.baseHp; // 현재 체력
    this.damage = 30;
    this.isEvolved = false; // 진화 여부 확인
    this.acc = {
      // 스킬 명중률
      quickAttack: 100,
      thunderShock: 80,
      spark: 70,
      thunderBolt: 50,
      electricWall: 60,
      chainLightning: 100,
    };
    this.electricWallActive = false; // 일렉트릭 월 활성화 상태
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
    const skillDamage = this.damage * damageMultiplier;

    if (randomChance <= hitChance) {
      monster.hp -= skillDamage;
      return { success: true, skillDamage: skillDamage }; // 공격 성공, 피해량 반환
    } else {
      return { success: false }; // 공격 실패
    }
  }

  quickAttack(monster) {
    return this.attackWithAccuracy("quickAttack", monster, 1);
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

  electricWall() {
    const hitChance = this.acc["electricWall"];
    const randomChance = Math.round(Math.random() * 100);

    if (randomChance <= hitChance) {
      this.electricWallActive = true;
      return { success: true }; // 일렉트릭 월 성공적으로 사용
    } else {
      return { success: false }; // 일렉트릭 월 실패
    }
  }

  chainLightning(monster) {
    let attacks = Math.floor(Math.random() * 2) + 2; // 2~3회 랜덤으로 공격
    let totalDamage = 0; // 총 데미지 초기화

    for (let i = 0; i < attacks; i++) {
      const attackResult = this.attackWithAccuracy(
        "chainLightning",
        monster,
        1
      );
      if (attackResult.success) {
        totalDamage += attackResult.skillDamage; // attackWithAccuracy에서 반환된 데미지를 누적
      }
    }

    if (totalDamage > 0) {
      return {
        success: true,
        skillDamage: totalDamage,
        attacks: attacks,
      };
    } else {
      return {
        success: false,
        attacks: attacks,
      };
    }
  }

  run() {
    return 50 >= Math.round(Math.random() * 100);
  }
}

// 야생 몬스터
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
      tackle: { name: "몸통박치기", damageMultiplier: 1, accuracy: 90 },
      leafCutter: { name: "잎날가르기", damageMultiplier: 2, accuracy: 80 },
      vineWhip: { name: "풀묶기", damageMultiplier: 3, accuracy: 70 },
      solarBeam: { name: "솔라빔", damageMultiplier: 5, accuracy: 50 },
    };
  }

  // 명중률 계산
  attackWithAccuracy(skill, player) {
    const hitChance = skill.accuracy;
    const randomChance = Math.round(Math.random() * 100);

    if (randomChance <= hitChance) {
      // 일렉트릭 월이 활성화되어 있으면 공격 무효화
      if (player.electricWallActive) {
        player.electricWallActive = false; // 한 번 공격 방어 후 비활성화
        return { success: false, skillName: skill.name, blocked: true };
      } else {
        player.hp -= this.damage * skill.damageMultiplier;
        return {
          success: true,
          skillName: skill.name,
          damage: this.damage * skill.damageMultiplier,
        };
      }
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

// 딜레이 함수
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 배틀 상태창
function displayStatus(stage, player, monster) {
  console.log(
    chalk.magentaBright(`\n${"=".repeat(32)} 배틀 상태 ${"=".repeat(32)}`)
  );
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(
        `| ${player.name}의 HP : ${player.hp}, Level : ${player.level} `
      ) +
      chalk.redBright(
        `| ${monster.name}의 HP : ${monster.hp}, 공격력 : ${monster.damage} |`
      )
  );
  console.log(chalk.magentaBright(`${"=".repeat(75)}\n`));
}

// 포켓몬 배틀
const battle = async (stage, player, monster) => {
  let logs = [];
  let boss = false; // 최종 보스 알림 여부

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    // 최종 보스 메시지 출력 (단 한 번만)
    if (stage === 10 && !boss) {
      logs.push(chalk.redBright("!!! 최종 보스와의 전투입니다 !!!"));
      console.log(logs[logs.length - 1]);
      await delay(1000); // 1초 대기
      boss = true; // 메시지 출력 후 상태 변경
    }

    console.log(
      chalk.green(
        `\n1. 전광석화(${player.damage}) 2. 전기쇼크(${player.damage * 2}) 3. 스파크(${player.damage * 3}) 4. 10만볼트(${player.damage * 5}) 5. 일렉트릭 월(방어) 6. 체인 라이트닝(랜덤 연속 공격) 7. 도망간다!`
      )
    );
    const choice = readlineSync.question("당신의 선택은? ");

    let attackResult;
    let vaildChoice = true;
    switch (choice) {
      case "1":
        logs.push(chalk.green(`\n가랏! ${player.name}! 전광석화!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackResult = player.quickAttack(monster);
        break;
      case "2":
        logs.push(chalk.green(`\n가랏! ${player.name}! 전기쇼크!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackResult = player.thunderShock(monster);
        break;
      case "3":
        logs.push(chalk.green(`\n가랏! ${player.name}! 스파크!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackResult = player.spark(monster);
        break;
      case "4":
        logs.push(chalk.green(`\n가랏! ${player.name}! 10만볼트!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackResult = player.thunderBolt(monster);
        break;
      case "5": // 일렉트릭 월
        const wallResult = player.electricWall();
        if (wallResult.success) {
          logs.push(chalk.green(`\n가랏! ${player.name}! 일렉트릭 월!!!`));
          logs.push(
            chalk.green(`${player.name}의 일렉트릭 월이 활성화되었습니다!`)
          );
        } else {
          logs.push(chalk.red(`\n가랏! ${player.name}! 일렉트릭 월!!!`));
          logs.push(chalk.red(`${player.name}의 일렉트릭 월이 실패했습니다!`));
        }
        console.log(logs[logs.length - 1]);
        await delay(500);
        break;

      case "6": // 체인 라이트닝
        logs.push(chalk.green(`\n가랏! ${player.name}! 체인 라이트닝!!!`));
        console.log(logs[logs.length - 1]);
        await delay(500);
        attackResult = player.chainLightning(monster);
        logs.push(
          chalk.green(
            `${player.name}가 체인 라이트닝으로 ${attackResult.attacks}번 공격했습니다!`
          )
        );
        break;
      case "7": // 도망가기
        if (stage === 10) {
          logs.push(chalk.redBright("\n최종보스는 도망갈 수 없습니다!"));
          console.log(logs[logs.length - 1]);
          vaildChoice = false; // 도망 시도 실패로 처리
          break; // switch 문을 벗어나기 위해 break 추가
        }
        if (player.run() === true) {
          console.log(chalk.white("\n무사히 도망쳤다!"));
          await delay(1000);
          return true; // 도망 성공 시 true 반환
        } else {
          logs.push(chalk.redBright("\n도망칠 수 없다!"));
          console.log(logs[logs.length - 1]);
          vaildChoice = false;
          break;
        }
      default:
        logs.push(chalk.red("\n잘못된 선택입니다. 다시 선택하세요"));
        vaildChoice = false;
    }
    // 플레이어가 몬스터를 공격
    if (vaildChoice && choice !== "7") {
      await delay(500);

      // attackResult가 정의되어 있는지 확인
      if (attackResult && attackResult.success) {
        logs.push(chalk.white(`${player.name}의 공격이 명중했습니다! `));
        logs.push(
          chalk.white(`${attackResult.skillDamage}의 피해를 입혔습니다!`)
        );
        // 몬스터의 HP가 0 이하로 떨어진 경우
        if (monster.hp <= 0) {
          logs.push(chalk.blueBright(`야생의 ${monster.name}이(가) 쓰러졌다!`));
          await delay(500);
          return false; // 배틀 종료
        }
      } else if (attackResult && !attackResult.success) {
        logs.push(chalk.red(`${player.name}의 공격이 빗나갔습니다...`));
      }
    }

    // 몬스터가 플레이어를 공격
    if (player.hp > 0 && monster.hp > 0) {
      await delay(500);

      // 일렉트릭 월이 활성화된 경우
      if (player.electricWallActive) {
        logs.push(
          chalk.blue(`${monster.name}의 공격이 일렉트릭 월에 의해 막혔다!`)
        );
        player.electricWallActive = false;
      } else {
        // 일렉트릭 월이 활성화되지 않은 경우 몬스터의 공격을 처리
        const monsterAttack = monster.attack(player);

        if (monsterAttack.success) {
          logs.push(
            chalk.red(
              `야생의 ${monster.name}이(가) ${monsterAttack.skillName}를 사용했다! ${monsterAttack.damage}의 피해를 입었다!`
            )
          );
          if (player.hp <= 0) {
            await delay(500);
            logs.push(chalk.redBright(`\n${player.name}은(는) 쓰러졌다...!`));
            await delay(500);
            logs.push(chalk.white(`당신은 눈앞이 깜깜해졌다!`));
            await delay(500);
            console.clear();
            displayStatus(stage, player, monster);
            logs.forEach((log) => console.log(log));
            console.log(
              chalk.yellow("피카로그를 재도전 하실꺼면 1을 누르세요.")
            );
            console.log(chalk.yellow("피카로그를 포기하려면 2를 누르세요."));
            const choice = readlineSync.question("당신의 선택은? ");

            if (choice === "1") {
              console.log(chalk.green("피카로그를 재도전 합니다..."));
              await delay(500);
              console.log(chalk.green("Good Luck...!"));
              await delay(1500);
              return "restart"; // 재시작 선택 시 "restart" 반환
            } else {
              console.log(chalk.green("게임을 종료합니다. 감사합니다!"));
              return "quit"; // 포기 선택 시 "quit" 반환
            }
          }
        } else {
          logs.push(
            chalk.blue(
              `야생의 ${monster.name}이(가) ${monsterAttack.skillName}를 사용했지만 빗나갔다!`
            )
          );
        }
      }
    }

    // 배틀중에 로그에 나타나는 상태창
    logs.push(
      chalk.blueBright(`| ${player.name}의 HP : ${player.hp} `) +
        chalk.redBright(`| ${monster.name}의 HP : ${monster.hp}|`)
    );
  }

  return false; // 배틀이 끝난 후 도망치지 않았다면 false 반환
};

// 타이핑 효과 함수
async function typeEffect(text, delayMs = 100) {
  for (let char of text) {
    process.stdout.write(char); // 한 글자씩 출력
    await delay(delayMs); // 지정된 시간만큼 대기
  }
  console.log(); // 마지막에 줄바꿈
}

// 게임 시작
export async function startGame() {
  console.clear();

  // 인트로 메시지 추가
  // await typeEffect(
  //   "당신은 앞으로 피카츄와 함께 10개의 스테이지를 도전하게됩니다.\n",
  //   50
  // );
  // await delay(1000); // 1초 대기 후 게임 시작
  // await typeEffect(
  //   "10개의 스테이지를 클리어하고 최고의 포켓몬에 도전하세요!\n",
  //   50
  // );
  // await delay(1000); // 1초 대기 후 게임 시작
  // await typeEffect("그럼, 행운을 빕니다! Good Luck!\n", 50);
  // await delay(2000); // 1초 대기 후 게임 시작

  const player = new Player();
  let stage = 1;

  while (stage <= 10 && player.hp > 0) {
    const monster = new Monster(stage);

    const result = await battle(stage, player, monster);

    if (result === "restart") {
      return startGame(); // 게임 재시작
    } else if (result === "quit") {
      return; // 게임 종료
    } else if (!result) {
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

      // 진화 및 진화 메시지 출력
      if (player.level === 5 && !player.isEvolved) {
        console.clear();
        console.log("....  오잉!?");
        await delay(500);
        console.log("피카츄의 상태가...!");
        await delay(500);
        console.log("...");
        await delay(500);
        console.log("...");
        await delay(1000);
        console.log(
          chalk.yellow("\n축하합니다! 피카츄는 라이츄로 진화했습니다!!")
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
      console.log(chalk.red(`\n\n야생의 몬스터가 나타났다!`));
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
