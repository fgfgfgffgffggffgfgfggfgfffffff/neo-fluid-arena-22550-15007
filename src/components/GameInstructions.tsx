import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

export const GameInstructions = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="glass-effect border-border/50 hover:border-primary/50"
        >
          📖 游戏说明
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            游戏玩法与AI特性
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* 基础操作 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🎮</span> 基础操作
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">🖱️</span>
                  <span><strong>鼠标移动</strong> - 控制玩家移动方向</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">🎯</span>
                  <span><strong>鼠标点击</strong> - 快速射击</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">🤖</span>
                  <span><strong>按键A</strong> - AI模式（召唤2个轨道护卫，自动瞄准射击）</span>
                </li>
              </ul>
          </div>
          
          {/* 玩法更新 */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-2xl">🆕</span> 最新玩法（战术AI系统）
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-accent">•</span><span><strong>随机分波</strong>：每波10个敌人，随机组成（Boss 40%, 刺客30%, 普通30%）</span></li>
              <li className="flex items-start gap-2"><span className="text-accent">•</span><span><strong>Boss指挥系统</strong>：Boss可发出指令给普通AI，指挥冲锋/包围/侧翼</span></li>
              <li className="flex items-start gap-2"><span className="text-accent">•</span><span><strong>整齐编队</strong>：Boss组成规划的圆形包围阵型，更具策略性</span></li>
              <li className="flex items-start gap-2"><span className="text-accent">•</span><span><strong>护卫射击</strong>：按A键激活2个轨道护卫，发射小激光炮自动攻击</span></li>
              <li className="flex items-start gap-2"><span className="text-accent">•</span><span><strong>防御AI</strong>：黄色防御者会锁定并减速玩家（每波30%概率出现1个）</span></li>
              <li className="flex items-start gap-2"><span className="text-accent">•</span><span><strong>战术分析</strong>：实时AI判断包围薄弱点，Boss战术指挥</span></li>
            </ul>
          </div>
 
          {/* 小兵AI */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">👾</span> 小兵AI（紫色）
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>血量</strong> - 10点生命值</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>生成机制</strong> - 持续生成，最多8个同时存在</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>学习能力</strong> - 记录玩家攻击模式，预测移动路径</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>团队协作</strong> - 计算最佳进攻角度，填补覆盖空缺</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>护盾系统</strong> - 每个AI有一次护盾，可阻挡一次攻击</span>
                </li>
              </ul>
            </div>

            {/* 刺客AI */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">⚡</span> 刺客AI（黄色）
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>速度</strong> - 比玩家快，围绕玩家旋转</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>生成机制</strong> - 每次2个，击杀后2秒重生</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>寿命</strong> - 30秒后自动消散并重生</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>充能攻击</strong> - 围绕2圈后会冲向玩家</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>拖尾特效</strong> - 移动时有明显的消散拖尾</span>
                </li>
              </ul>
            </div>

            {/* 攻击者AI */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🔴</span> Boss AI（红色）
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>血量</strong> - 10点生命值，护盾100点</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>科技追踪线</strong> - 红色虚线连接玩家</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>伤害</strong> - 碰撞造成5点伤害</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>编队策略</strong> - 1个攻击，其余组成圆形包围（激活护盾）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>波次系统</strong> - 每波6个Boss，击杀6个后生成新波</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>子弹预判</strong> - 可预测子弹轨迹并极限躲避（速度超过玩家）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>学习系统</strong> - 记录玩家移动模式并预判位置</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>动态难度</strong> - 随玩家分数提升速度和攻击性</span>
                </li>
              </ul>
            </div>

            {/* 防御者AI */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🟡</span> 防御者AI（蓝色）
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>红色瞄准线</strong> - 显示AI的攻击路径</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>优先级系统</strong> - 攻击优先级1，生存优先级2</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>学习能力</strong> - 记录玩家攻击模式，预测移动路径</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>团队协作</strong> - 计算最佳进攻角度，填补覆盖空缺</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>600px检测范围</strong> - 扫描周围实体，智能规避</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>护盾系统</strong> - 每个AI有一次护盾，可阻挡一次攻击</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>进化系统</strong> - 表现优秀的AI会升级（最高Lv5），获得增强能力：
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>→ 预测准确度提升15%/级</li>
                      <li>→ 检测范围提升20%/级</li>
                      <li>→ 团队协作提升10%/级</li>
                      <li>→ 学习速率提升12%/级</li>
                    </ul>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>多样化攻击模式</strong> - 闪避、侧翼、撤退、进攻、预测等多种战术</span>
                </li>
              </ul>
            </div>

            {/* 防御者AI */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🟡</span> 防御者AI（黄色）
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>移动速度</strong> - 比玩家射击速度快</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>减速效果</strong> - 锁定玩家时减少50%移动速度</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>拼接防线</strong> - 可以拼接在一起形成防线，玩家无法通过</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>生成机制</strong> - 每次生成3个，必须全部击杀才会再生成3个</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>优先级系统</strong> - 牵制玩家优先级1，防御优先级2</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span><strong>特殊规则</strong> - 不能射击，只能锁定玩家；攻击者AI可以穿过防御者</span>
                </li>
              </ul>
            </div>

            {/* AI训练系统 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🎓</span> AI训练系统
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>实时学习</strong> - AI会记录每次闪避、被击中的情况</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>奖励机制</strong> - 成功闪避+50分，生存时间加分，每5次闪避获得学习奖励</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>惩罚机制</strong> - 被击中-30分，死亡增加罪恶值</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>排行榜系统</strong> - 实时追踪AI表现，展示前5名</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>训练日志</strong> - 每15秒记录一次AI训练结果和种群指标</span>
                </li>
              </ul>
            </div>

            {/* 游戏技巧 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">💡</span> 游戏技巧
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>优先击杀刺客AI，它们速度快且主动攻击</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>注意Boss的子弹预判能力，使用不规则移动模式</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>先击破Boss护盾，再攻击Boss本体</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>AI自动瞄准模式适合快速清理，但伤害较低</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>小心刺客的围绕攻击模式，保持移动</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
