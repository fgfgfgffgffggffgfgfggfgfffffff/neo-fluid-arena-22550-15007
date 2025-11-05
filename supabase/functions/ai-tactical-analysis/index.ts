import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gameState } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `你是一个专业的射击游戏战术AI教练。根据玩家的实时游戏状态，提供简洁有效的战术建议。
建议必须：
1. 不超过20个字
2. 直接可执行
3. 针对当前危险情况
4. 使用中文

游戏状态说明：
- health: 玩家生命值(0-100)
- enemyCount: 当前敌人数量
- kills: 击杀数
- deaths: 死亡数
- accuracy: 命中率(0-100)
- wave: 当前波数
- difficultyMultiplier: 难度倍数`;

    const userPrompt = `当前游戏状态：
生命值: ${gameState.health}%
敌人数量: ${gameState.enemyCount}
击杀/死亡: ${gameState.kills}/${gameState.deaths}
命中率: ${gameState.accuracy}%
当前波数: ${gameState.wave}
难度倍数: ${gameState.difficultyMultiplier}x

请给出一条简短的战术建议（不超过20字）：`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices[0].message.content.trim();

    // 根据游戏状态判断建议类型
    let type = 'info';
    if (gameState.health < 30) {
      type = 'critical';
    } else if (gameState.enemyCount > 5 || gameState.health < 50) {
      type = 'warning';
    } else if (gameState.kills > gameState.deaths * 2) {
      type = 'positive';
    }

    return new Response(
      JSON.stringify({ advice, type }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in ai-tactical-analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        advice: '保持警惕，稳定输出',
        type: 'info'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
