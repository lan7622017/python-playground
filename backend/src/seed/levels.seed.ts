// 关卡内容种子数据（12 关）
// 素材来源：python_study 仓库中的学习文档（第一天~第四天学习文档、f-string详解.py），按"PM 实战场景"改写
// 剧情主线：产品经理"小澜"入职"星云科技"，用 Python 解决职场问题
// 约定：新增/修改关卡 = 只改这个文件的数据，业务代码零改动
// 第三章（9~12 关）：AI 协作时代训练——【读 AI】读懂/修复 AI 生成的代码，【手搓】脱离 AI 自己写
// 未来若引入新题型（选择题/判断题），在 shared/src/level.ts 增加可选字段（如 judgeMode/options），缺省即现有行为
import type { Level } from 'python-playground-shared';

/** 12 关数据（id 由数据库自动生成） */
export const LEVEL_SEED: Omit<Level, 'id'>[] = [
  // ==================== 第一章：初入职场（基础语法） ====================
  {
    order: 1,
    chapter: '第一章：初入职场',
    title: '认识变量与类型',
    story:
      '小澜第一天入职星云科技，IT 给了她一份用户信息表。要想读懂这份数据，得先认识 Python 里最基本的四种类型。',
    points: 10,
    badgeId: null,
    contentMd: `## 本关目标
学会用变量保存数据，认识 int（整数）、float（浮点数）、str（字符串）、bool（布尔值）四种基本类型。

## 什么是变量？
变量就像**贴了标签的盒子**，用来保存数据：

\`\`\`python
age = 28          # 整数 int
price = 19.9      # 浮点数 float
name = "小澜"     # 字符串 str
is_vip = True     # 布尔值 bool（只有 True / False 两种）
\`\`\`

## 怎么查看类型？
用 \`type()\` 函数：

\`\`\`python
print(type(age))      # <class 'int'>
print(type(name))     # <class 'str'>
\`\`\`

## 类型转换
不同类型之间可以转换，最常用的是字符串转数字：

\`\`\`python
score = int("88")     # 字符串 → 整数，结果是 88
price = float("19.9") # 字符串 → 浮点数
\`\`\`

> 💡 记忆口诀：**int 是整数、float 是小数、str 是文本、bool 是开关**。`,
    starterCode: `# 用户信息（已给出）
user_name = "小澜"
user_age = 28
user_height = 1.68
is_employee = True

# TODO 1: 用 type() 检查 user_age 的类型，赋值给 age_type
age_type = None

# TODO 2: 把字符串 "88" 转换成整数，赋值给 score
score_str = "88"
score = None`,
    answerCode: `# 用户信息（已给出）
user_name = "小澜"
user_age = 28
user_height = 1.68
is_employee = True

# TODO 1: 用 type() 检查 user_age 的类型，赋值给 age_type
age_type = type(user_age)

# TODO 2: 把字符串 "88" 转换成整数，赋值给 score
score_str = "88"
score = int(score_str)`,
    testCode: `# === 测试（请勿修改） ===
assert isinstance(user_name, str), "user_name 应该是字符串"
assert isinstance(user_age, int), "user_age 应该是整数"
assert isinstance(user_height, float), "user_height 应该是浮点数"
assert isinstance(is_employee, bool), "is_employee 应该是布尔值"
assert age_type == int, "age_type 应该是 int 类型，试试 type(user_age)"
assert score == 88, "score 应该等于 88，试试 int('88')"
print("🎉 全部通过！")`,
    hints: [
      'type() 用来查看类型：type(变量)',
      "字符串转整数：int('88')",
      'age_type 直接赋值 type(user_age)；score 赋值 int(score_str)',
    ],
  },
  {
    order: 2,
    chapter: '第一章：初入职场',
    title: 'f-string 输出魔法',
    story:
      '运营部门要发用户欢迎语，小澜发现手工拼接文本又慢又容易出错——她需要 f-string 这个魔法。',
    points: 15,
    badgeId: 'badge-level-2',
    contentMd: `## 本关目标
学会用 f-string 把变量嵌入字符串，并控制数字的显示格式。

## 什么是 f-string？
在字符串前加 \`f\`，用 \`{变量}\` 占位，Python 会自动把变量的值填进去：

\`\`\`python
name = "小澜"
points = 88
welcome = f"欢迎 {name} 回来！你的积分为 {points}"
print(welcome)  # 欢迎 小澜 回来！你的积分为 88
\`\`\`

## 控制数字格式
用 \`{变量:.2f}\` 保留两位小数：

\`\`\`python
price = 19.9
print(f"商品价格 {price:.2f} 元")  # 商品价格 19.90 元
\`\`\`

## 在 f-string 里放表达式
花括号里不只能放变量，还能放计算结果：

\`\`\`python
print(f"一年后年龄: {28 + 1}")  # 一年后年龄: 29
\`\`\`

> 💡 记忆口诀：**f 开头、花括号、自动填**。`,
    starterCode: `# 用户数据（已给出）
name = "小澜"
points = 88
price = 19.9

# TODO 1: 用 f-string 生成欢迎语，格式：欢迎 小澜 回来！你的积分为 88
welcome = None

# TODO 2: 用 f-string 显示价格并保留两位小数，格式：商品价格 19.90 元
price_text = None`,
    answerCode: `# 用户数据（已给出）
name = "小澜"
points = 88
price = 19.9

# TODO 1: 用 f-string 生成欢迎语，格式：欢迎 小澜 回来！你的积分为 88
welcome = f"欢迎 {name} 回来！你的积分为 {points}"

# TODO 2: 用 f-string 显示价格并保留两位小数，格式：商品价格 19.90 元
price_text = f"商品价格 {price:.2f} 元"`,
    testCode: `# === 测试（请勿修改） ===
assert welcome == "欢迎 小澜 回来！你的积分为 88", "welcome 格式不对，对照格式：欢迎 小澜 回来！你的积分为 88"
assert price_text == "商品价格 19.90 元", "price_text 应为：商品价格 19.90 元（保留两位小数）"
print("🎉 全部通过！")`,
    hints: [
      'f-string 写法：f"文本 {变量} 文本"',
      '保留两位小数：{price:.2f}',
      '注意 welcome 的完整格式要一字不差：欢迎 小澜 回来！你的积分为 88',
    ],
  },
  {
    order: 3,
    chapter: '第一章：初入职场',
    title: '字符串处理：清理用户评论',
    story:
      '运营让小澜审核一批用户评论，里面有空格、有敏感词。字符串处理三件套：strip、replace、len。',
    points: 20,
    badgeId: null,
    contentMd: `## 本关目标
学会字符串常用操作：去除空白（strip）、替换（replace）、统计长度（len）。

## 去除首尾空白：strip()
用户输入的文本常带多余空格：

\`\`\`python
comment = "  你好，世界  "
print(comment.strip())  # 你好，世界
\`\`\`

## 替换内容：replace()
把"便宜"换成更得体的"实惠"：

\`\`\`python
text = "价格便宜"
print(text.replace("便宜", "实惠"))  # 价格实惠
\`\`\`

## 统计长度：len()
\`\`\`python
print(len("你好"))   # 2（中文字符按 1 个计数）
print(len("a b"))    # 3（空格也算字符）
\`\`\`

> 💡 记忆口诀：**strip 去两边、replace 换内容、len 数个数**。`,
    starterCode: `# 一条待审核的用户评论（已给出）
comment = "  这款产品真的好用，价格便宜   "

# TODO 1: 去掉评论首尾的空格
cleaned = None

# TODO 2: 统计评论的字数（不包含空格字符）
char_count = None

# TODO 3: 在清洗后的评论上，把"便宜"替换为"实惠"
polished = None`,
    answerCode: `# 一条待审核的用户评论（已给出）
comment = "  这款产品真的好用，价格便宜   "

# TODO 1: 去掉评论首尾的空格
cleaned = comment.strip()

# TODO 2: 统计评论的字数（不包含空格字符）
char_count = len(cleaned.replace(" ", ""))

# TODO 3: 在清洗后的评论上，把"便宜"替换为"实惠"
polished = cleaned.replace("便宜", "实惠")`,
    testCode: `# === 测试（请勿修改） ===
assert cleaned == "这款产品真的好用，价格便宜", "cleaned 应去掉首尾空格"
assert char_count == 13, "字数应为 13（不含空格）"
assert polished == "这款产品真的好用，价格实惠", "替换结果应为：价格实惠"
print("🎉 全部通过！")`,
    hints: [
      'strip() 去掉首尾空白',
      "先 replace(' ', '') 去掉空格，再用 len() 统计",
      "替换：cleaned.replace('便宜', '实惠')",
    ],
  },
  {
    order: 4,
    chapter: '第一章：初入职场',
    title: '列表基础：整理埋点数据',
    story:
      '小澜拿到一周的页面访问埋点数据，有重复、没排序。她用列表的招式：len、去重、sorted。',
    points: 25,
    badgeId: 'badge-level-4',
    contentMd: `## 本关目标
学会列表的创建、统计（len）、去重、排序（sorted）。

## 什么是列表？
列表用方括号，可以放一组数据：

\`\`\`python
visits = [101, 203, 101, 305]
print(len(visits))   # 4，元素个数
\`\`\`

## 去重：用 in 判断
遍历时检查元素是否已经存在：

\`\`\`python
seen = []
for v in visits:
    if v not in seen:
        seen.append(v)
print(seen)  # [101, 203, 305]
\`\`\`

## 排序：sorted()
\`\`\`python
nums = [3, 1, 2]
print(sorted(nums))       # [1, 2, 3]（升序，返回新列表）
print(sorted(nums, reverse=True))  # [3, 2, 1]（降序）
\`\`\`

> 💡 记忆口诀：**len 数个数、in 查存在、append 追加、sorted 排序**。`,
    starterCode: `# 本周用户访问的页面 ID（有重复，已给出）
visits = [101, 203, 101, 305, 203, 101, 407]

# TODO 1: 计算总访问次数
total_visits = None

# TODO 2: 去重（用 for 循环 + in 判断，结果存入 unique_pages）
unique_pages = []

# TODO 3: 把去重后的页面升序排序
sorted_pages = None`,
    answerCode: `# 本周用户访问的页面 ID（有重复，已给出）
visits = [101, 203, 101, 305, 203, 101, 407]

# TODO 1: 计算总访问次数
total_visits = len(visits)

# TODO 2: 去重（用 for 循环 + in 判断，结果存入 unique_pages）
seen = []
for v in visits:
    if v not in seen:
        seen.append(v)
unique_pages = seen

# TODO 3: 把去重后的页面升序排序
sorted_pages = sorted(unique_pages)`,
    testCode: `# === 测试（请勿修改） ===
assert total_visits == 7, "总访问次数应为 7"
assert len(unique_pages) == 4, "去重后应剩 4 个页面"
assert sorted(unique_pages) == [101, 203, 305, 407], "去重后的页面集合不对"
assert sorted_pages == [101, 203, 305, 407], "排序结果应为升序 [101, 203, 305, 407]"
print("🎉 全部通过！")`,
    hints: [
      'len(列表) 统计个数',
      "去重思路：if v not in seen 时 append(v)",
      'sorted(列表) 返回升序新列表',
    ],
  },

  // ==================== 第二章：数据魔法（数据结构） ====================
  {
    order: 5,
    chapter: '第二章：数据魔法',
    title: '列表推导式：一行搞定筛选',
    story:
      '小澜要对一周的订单金额做分析：打折、筛选大单、转文本。她想用最简洁的方式——列表推导式。',
    points: 30,
    badgeId: null,
    contentMd: `## 本关目标
学会列表推导式：用一行代码完成「循环 + 处理」甚至「循环 + 筛选」。

## 基本结构
\`[表达式 for 变量 in 列表]\`：把每个元素处理一遍，收集进新列表：

\`\`\`python
amounts = [100, 200, 300]
# 每个金额打 8 折
new = [a * 0.8 for a in amounts]
print(new)  # [80.0, 160.0, 240.0]
\`\`\`

## 带条件筛选
加 \`if\` 就变成「先筛选、再处理」：

\`\`\`python
# 只保留大于等于 300 的金额
big = [a for a in amounts if a >= 300]
\`\`\`

## 转换文本格式
处理表达式可以是任意计算，包括 f-string：

\`\`\`python
texts = [f"{a}元" for a in amounts]  # ['100元', '200元', '300元']
\`\`\`

> 💡 记忆口诀：**先写表达式、再写循环、最后写条件**。`,
    starterCode: `# 一周的订单金额（元，已给出）
amounts = [58, 320, 99, 500, 12, 880, 45]

# TODO 1: 用列表推导式，把所有金额打 8 折（× 0.8）
discounted = []

# TODO 2: 用列表推导式，筛选出金额 >= 300 的大额订单
big_orders = []

# TODO 3: 用列表推导式，把金额转换为带"元"后缀的文本
amount_texts = []`,
    answerCode: `# 一周的订单金额（元，已给出）
amounts = [58, 320, 99, 500, 12, 880, 45]

# TODO 1: 用列表推导式，把所有金额打 8 折（× 0.8）
discounted = [a * 0.8 for a in amounts]

# TODO 2: 用列表推导式，筛选出金额 >= 300 的大额订单
big_orders = [a for a in amounts if a >= 300]

# TODO 3: 用列表推导式，把金额转换为带"元"后缀的文本
amount_texts = [f"{a}元" for a in amounts]`,
    testCode: `# === 测试（请勿修改） ===
assert abs(discounted[0] - 46.4) < 0.001, "第一个金额 58 打 8 折应为 46.4（注意浮点误差）"
assert big_orders == [320, 500, 880], "大于等于 300 的金额应为 [320, 500, 880]"
assert amount_texts[0] == "58元", "文本格式应为：58元"
print("🎉 全部通过！")`,
    hints: [
      '推导式结构：[表达式 for 变量 in 列表]',
      '带条件：[表达式 for 变量 in 列表 if 条件]',
      '金额转文本：f"{a}元"',
    ],
  },
  {
    order: 6,
    chapter: '第二章：数据魔法',
    title: '字典：搭建用户画像',
    story:
      '小澜要给运营搭建用户画像卡片：姓名、城市、标签……一个字典就是一个完整的画像。',
    points: 35,
    badgeId: 'badge-level-6',
    contentMd: `## 本关目标
学会字典的创建、取值（[] 和 get）、判断键是否存在（in）、新增键值对。

## 什么是字典？
字典用花括号，是「键-值对」的集合，就像一本通讯录：

\`\`\`python
user = {
    "name": "小澜",
    "city": "北京",
    "tags": ["产品", "数据"]
}
\`\`\`

## 取值
\`\`\`python
print(user["name"])   # 小澜（键不存在会报错）
print(user.get("job", "未知"))  # 未知（get 安全，可带默认值）
\`\`\`

## 判断键是否存在：in
\`\`\`python
print("city" in user)   # True
print("age" in user)    # False
\`\`\`

## 新增/修改键值对
直接赋值即可：

\`\`\`python
user["level"] = "P7"   # 新增
user["name"] = "小兰"  # 修改
\`\`\`

> 💡 记忆口诀：**中括号取值、get 带默认、in 查存在、赋值即新增**。`,
    starterCode: `# 用户画像数据（已给出）
user_profile = {
    "name": "小澜",
    "age": 28,
    "city": "北京",
    "tags": ["产品", "数据", "音乐"]
}

# TODO 1: 取出用户的姓名
user_name = None

# TODO 2: 用 get() 安全获取"职业"，不存在时返回"未知"
job = None

# TODO 3: 判断用户是否来自北京
is_beijing = None

# TODO 4: 新增一个键值对：level 为 "P7"（直接对 user_profile 赋值）
user_profile["level"] = None`,
    answerCode: `# 用户画像数据（已给出）
user_profile = {
    "name": "小澜",
    "age": 28,
    "city": "北京",
    "tags": ["产品", "数据", "音乐"]
}

# TODO 1: 取出用户的姓名
user_name = user_profile["name"]

# TODO 2: 用 get() 安全获取"职业"，不存在时返回"未知"
job = user_profile.get("job", "未知")

# TODO 3: 判断用户是否来自北京
is_beijing = "北京" in user_profile["city"]

# TODO 4: 新增一个键值对：level 为 "P7"
user_profile["level"] = "P7"`,
    testCode: `# === 测试（请勿修改） ===
assert user_name == "小澜", "姓名取错了，试试 user_profile['name']"
assert job == "未知", "get 的默认值应为 未知"
assert is_beijing is True, "应该判断出用户在北京"
assert user_profile["level"] == "P7", "新增键值对失败，试试 user_profile['level'] = 'P7'"
print("🎉 全部通过！")`,
    hints: [
      "字典取值：dict['键']",
      "安全取值：dict.get('键', 默认值)",
      "新增键值对：dict['新键'] = 值",
    ],
  },
  {
    order: 7,
    chapter: '第二章：数据魔法',
    title: 'JSON 解析：读懂接口返回',
    story:
      '后端同事甩过来一段 JSON 字符串，小澜盯着它看了半天。别慌——json.loads 一秒钟变字典。',
    points: 40,
    badgeId: null,
    contentMd: `## 本关目标
学会把 JSON 字符串解析成字典，并读取嵌套数据。

## JSON 就是字典的「传输形态」
后端接口返回的 JSON 字符串，本质就是嵌套的键值对结构。

## 解析：json.loads()
\`\`\`python
import json

api_response = '{"code": 200, "data": {"total": 3}}'
data = json.loads(api_response)
print(data["code"])   # 200
\`\`\`

## 读取嵌套数据：逐层取
\`\`\`python
products = data["data"]["products"]  # 一层一层往里取
first = products[0]["name"]          # 取第一件商品的名称
\`\`\`

## 找最大值：max + key
\`\`\`python
# 按销量（sales）取最大的商品
top = max(products, key=lambda p: p["sales"])
print(top["name"])
\`\`\`

> 💡 记忆口诀：**loads 是字符串转字典，嵌套数据一层层取**。`,
    starterCode: `import json

# 后端接口返回的 JSON 字符串（已给出）
api_response = """
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "products": [
      {"id": 1, "name": "蓝牙耳机", "price": 299, "sales": 1200},
      {"id": 2, "name": "智能手表", "price": 899, "sales": 560},
      {"id": 3, "name": "无线充电板", "price": 129, "sales": 2300}
    ]
  }
}
"""

# TODO 1: 把 JSON 字符串解析成字典
data = None

# TODO 2: 取出状态码
code = None

# TODO 3: 取出商品列表
products = []

# TODO 4: 找出销量最高的商品名称（先算最大销量，再遍历找出对应商品名）
top_product = ""`,
    answerCode: `import json

# 后端接口返回的 JSON 字符串（已给出）
api_response = """
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "products": [
      {"id": 1, "name": "蓝牙耳机", "price": 299, "sales": 1200},
      {"id": 2, "name": "智能手表", "price": 899, "sales": 560},
      {"id": 3, "name": "无线充电板", "price": 129, "sales": 2300}
    ]
  }
}
"""

# TODO 1: 把 JSON 字符串解析成字典
data = json.loads(api_response)

# TODO 2: 取出状态码
code = data["code"]

# TODO 3: 取出商品列表
products = data["data"]["products"]

# TODO 4: 找出销量最高的商品名称
sales_list = [p["sales"] for p in products]
max_sales = max(sales_list)
top_product = ""
for p in products:
    if p["sales"] == max_sales:
        top_product = p["name"]`,
    testCode: `# === 测试（请勿修改） ===
assert code == 200, "状态码应为 200"
assert len(products) == 3, "商品数量应为 3"
assert products[0]["name"] == "蓝牙耳机", "第一个商品名应为 蓝牙耳机"
assert top_product == "无线充电板", "销量最高的是 无线充电板（销量 2300）"
print("🎉 全部通过！")`,
    hints: [
      'json.loads(字符串) 把 JSON 转成字典',
      "嵌套取值：data['data']['products']",
      '先算最大销量，再遍历找出对应商品名',
    ],
  },
  {
    order: 8,
    chapter: '第二章：数据魔法',
    title: '综合实战：订单数据分析',
    story:
      '大考来了！老板扔给小澜 5 笔订单数据：总数、总金额、状态统计、最大订单、筛选已支付——全部拿下！',
    points: 50,
    badgeId: 'badge-level-8',
    contentMd: `## 本关目标
综合运用：JSON 解析 + 列表 + 字典 + 循环 + 推导式，完成一份订单分析报表。

## 数据长什么样？
订单列表是「列表套字典」结构——每个订单是一个字典：

\`\`\`python
orders = [
    {"id": "D001", "amount": 299, "status": "paid"},
    {"id": "D002", "amount": 899, "status": "paid"},
]
\`\`\`

## 统计：sum + len
\`\`\`python
total = sum(o["amount"] for o in orders)  # 总金额
count = len(orders)                        # 订单数
\`\`\`

## 分组统计：字典累加
\`\`\`python
status_count = {}
for o in orders:
    s = o["status"]
    status_count[s] = status_count.get(s, 0) + 1
\`\`\`

## 找最大值对象：max + key
\`\`\`python
max_order = max(orders, key=lambda o: o["amount"])
\`\`\`

> 💡 恭喜你走完第二章！学会这些，你就看懂了大多数接口返回的数据。`,
    starterCode: `import json

# 模拟订单数据（已给出）
orders_json = """
[
  {"id": "D001", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D002", "product": "智能手表", "amount": 899, "status": "paid"},
  {"id": "D003", "product": "无线充电板", "amount": 129, "status": "pending"},
  {"id": "D004", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D005", "product": "智能手表", "amount": 899, "status": "refund"}
]
"""

orders = json.loads(orders_json)

# TODO 1: 统计订单总数
order_count = None

# TODO 2: 计算所有订单的总金额
total_amount = None

# TODO 3: 统计每种状态的数量（返回字典，如 {"paid": 3}）
status_count = {}

# TODO 4: 找出金额最大的订单（保存整个订单字典）
max_order = None

# TODO 5: 筛选出已支付（paid）的订单
paid_orders = []`,
    answerCode: `import json

# 模拟订单数据（已给出）
orders_json = """
[
  {"id": "D001", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D002", "product": "智能手表", "amount": 899, "status": "paid"},
  {"id": "D003", "product": "无线充电板", "amount": 129, "status": "pending"},
  {"id": "D004", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D005", "product": "智能手表", "amount": 899, "status": "refund"}
]
"""

orders = json.loads(orders_json)

# TODO 1: 统计订单总数
order_count = len(orders)

# TODO 2: 计算所有订单的总金额
total_amount = sum(o["amount"] for o in orders)

# TODO 3: 统计每种状态的数量（返回字典，如 {"paid": 3}）
status_count = {}
for o in orders:
    status = o["status"]
    status_count[status] = status_count.get(status, 0) + 1

# TODO 4: 找出金额最大的订单（保存整个订单字典）
max_order = max(orders, key=lambda o: o["amount"])

# TODO 5: 筛选出已支付（paid）的订单
paid_orders = [o for o in orders if o["status"] == "paid"]`,
    testCode: `# === 测试（请勿修改） ===
assert order_count == 5, "订单总数应为 5"
assert total_amount == 2525, "总金额应为 2525（299+899+129+299+899）"
assert status_count == {"paid": 3, "pending": 1, "refund": 1}, "状态统计不对"
assert max_order["product"] == "智能手表", "金额最大的是智能手表 899 元"
assert len(paid_orders) == 3, "已支付订单应为 3 笔"
print("🎉 全部通过！你已是一名合格的数据分析师！")`,
    hints: [
      'sum(生成器) 求和、len(列表) 数个数',
      '状态统计：status_count.get(status, 0) + 1',
      '最大订单：max(orders, key=lambda o: o["amount"])',
    ],
  },

  // ==================== 第三章：AI 协作：读懂与验证 ====================
  {
    order: 9,
    chapter: '第三章：AI 协作：读懂与验证',
    title: '读懂 AI 的循环，自己写统计',
    story:
      'AI 秒回了一版"一周访问统计"代码，小澜一跑发现数字不对——她得读懂循环、亲手修复，再关掉 AI 自己写一个统计函数。',
    points: 55,
    badgeId: null,
    contentMd: `## 本关目标
学会读懂 AI 生成的循环代码、修复其中的逻辑 bug；脱离 AI，自己从头写一个统计函数。

## 循环：让代码反复做事
for 循环会按顺序取出列表里的每个元素：

\`\`\`python
visits = [1200, 800, 1000]
for v in visits:
    print(v)   # 依次打印 1200、800、1000
\`\`\`

## 判断 + 累加：统计满足条件的个数

\`\`\`python
big_days = 0
for v in visits:
    if v >= 1000:
        big_days = big_days + 1   # 计数器累加
\`\`\`

## continue：跳过不需要的记录

\`\`\`python
total = 0
for v in visits:
    if v == -1:
        continue    # 跳过这一条，继续下一条
    total = total + v
\`\`\`

## 函数：把"一段处理"装进盒子
def 定义函数，return 返回结果：

\`\`\`python
def add(a, b):
    return a + b
print(add(1, 2))   # 3
\`\`\`

> 🤖 AI 视角：AI 能一秒生成循环代码，但只有你能读懂它每一步在干什么，数字对不上时才能自己定位问题——这就是"看懂 AI 干了什么"。

> ✍️ 手搓时刻：自己写是理解的地基。函数是"给输入、得输出"的黑盒子，先会写简单的，才能驾驭 AI 生成的复杂的。

> 💡 记忆口诀：**for 取出每个元素、if 判断、continue 跳过、return 返回**。`,
    starterCode: `# 一周的页面访问量（已给出）
visits = [1200, 800, 1000, 300, 1500, -1, 900]

# ============ 【读 AI】AI 生成的代码，有一处逻辑漏了 ============
# AI 想统计"访问量 >= 1000 的天数"，但运行结果不对——它漏了判断条件
# 请读懂这段循环，补上缺失的条件
big_days = 0
for v in visits:
    # TODO: 这里漏了 if 条件，导致所有天数都被计入
    big_days = big_days + 1

# ============ 【读 AI】补全 continue 跳过无效记录 ============
# 数据里 -1 表示"当天数据缺失"，统计总和时应跳过它
# 请补上 continue 跳过的逻辑
invalids = 0
total_visits = 0
for v in visits:
    # TODO: 如果 v 是 -1，用 continue 跳过这一条
    total_visits = total_visits + v

# ============ 【手搓】自己写一个统计函数 ============
# 需求：函数 count_big_days(visits, threshold)
#   - visits：整数列表（第 1 个参数）
#   - threshold：阈值，>= threshold 都算（含等于，第 2 个参数）
#   - 返回：满足条件的元素个数
# 例：count_big_days([1200, 800, 1000], 1000) 返回 2
# 提示：for 遍历 + if 判断 + 计数器累加，最后 return
# 注意：函数体完全自己写，不要抄 AI 的

def count_big_days(visits, threshold):
    pass`,
    answerCode: `# 一周的页面访问量（已给出）
visits = [1200, 800, 1000, 300, 1500, -1, 900]

# ============ 【读 AI】AI 生成的代码，有一处逻辑漏了 ============
big_days = 0
for v in visits:
    if v >= 1000:
        big_days = big_days + 1

# ============ 【读 AI】补全 continue 跳过无效记录 ============
total_visits = 0
for v in visits:
    if v == -1:
        continue
    total_visits = total_visits + v

# ============ 【手搓】自己写一个统计函数 ============
def count_big_days(visits, threshold):
    count = 0
    for v in visits:
        if v >= threshold:
            count = count + 1
    return count`,
    testCode: `# === 测试（请勿修改） ===
if "count_big_days" not in dir():
    raise AssertionError("请先定义函数 count_big_days")
assert big_days == 3, "访问量 >= 1000 的天数应为 3（1200、1000、1500）"
assert total_visits == 5700, "总访问量应为 5700（1200+800+1000+300+1500+900，-1 应被跳过）"
assert count_big_days([1200, 800, 1000, 300, 1500], 1000) == 3, "count_big_days 应返回 3（>= 1000 的有 1200、1000、1500）"
assert count_big_days([1200, 800, 1000, 300, 1500], 800) == 4, "count_big_days 应返回 4（>= 800 的有 1200、800、1000、1500）"
assert count_big_days([], 5) == 0, "空列表应返回 0"
print("🎉 全部通过！")`,
    hints: [
      '修复循环：在 big_days = big_days + 1 前补上 if v >= 1000:（含等号）',
      '跳过无效记录：if v == -1: 后写 continue',
      '手搓函数：for 遍历 + if 判断 + 计数器累加，最后 return 计数器',
    ],
  },
  {
    order: 10,
    chapter: '第三章：AI 协作：读懂与验证',
    title: '函数与模块：修复 AI 的，写出自己的',
    story:
      'AI 写的折扣函数参数顺序反了、return 缩进错了，小澜按"验收四步"逐个修复；接着关掉 AI，自己手写一个面积函数，并学会 import 标准库。',
    points: 65,
    badgeId: 'badge-level-10',
    contentMd: `## 本关目标
学会函数定义（def）、参数默认值、return，以及 import 标准库模块。

## 函数：参数 → 处理 → 返回

\`\`\`python
def discount(price, rate=0.8):
    return price * rate
\`\`\`

- price、rate 是参数；\`rate=0.8\` 表示不传时默认 8 折
- return 后面的值就是函数的输出

## import：借用 Python 自带的工具

\`\`\`python
import math
print(math.pi)            # 3.141592653589793
print(round(math.pi, 2))  # 3.14
\`\`\`

## 缩进决定 return 属于谁

\`\`\`python
def f(x):
    if x > 0:
        return "正数"    # 只有 if 成立才返回
    return "非正数"      # 缩进在函数层级，一定会执行
\`\`\`

> 🤖 AI 视角：验收 AI 函数四步走——①看函数名（干什么）②看参数（要什么）③看 return（给什么）④跑测试（对不对）。AI 常把参数顺序写反、return 缩进写错，这两类 bug 用四步一眼就能发现。

> ✍️ 手搓时刻：函数是最小的"复用单元"。AI 时代，你能自己封装干净的函数，和 AI 协作的上限就越高——你给 AI 的指令，本质上就是"写一个函数"。

> 💡 记忆口诀：**def 定义、参数输入、return 输出、import 借用**。`,
    starterCode: `# ============ 【读 AI】修复 AI 写的折扣函数 ============
# AI 把参数顺序写反了：第 1 个参数应该是价格，第 2 个才是折扣率
# 需求：discount(price, rate=0.8) 返回 price * rate，rate 不传时默认 0.8
# 请修复参数顺序，并给 rate 加上默认值
def discount(rate, price):
    return price * rate

# ============ 【读 AI】修复 AI 的格式化函数 ============
# AI 写的 format_price：return 缩进错了，导致"元/千元"的判断失效
# 需求：>= 1000 显示为"x.x 千元"（如 1.2 千元）；否则显示为"x.x 元"（如 800.0 元）
# 请修复缩进，让两条 return 各归各位

def format_price(price):
    if price >= 1000:
        price = price / 1000
    return f"{price:.1f} 千元"

# ============ 【手搓】自己实现面积函数 ============
# 需求：函数 area(radius, digits=2)
#   - 用 import math 引入 Python 自带的数学模块（写在文件顶部或函数内都行）
#   - 面积 = math.pi * 半径的平方（半径的平方用 radius ** 2）
#   - 用 round(结果, digits) 保留 digits 位小数（digits 默认 2）
#   - 返回保留后的结果
# 例：area(1) 返回 3.14；area(2) 返回 12.57
# 注意：函数体完全自己写

def area(radius, digits=2):
    pass`,
    answerCode: `# ============ 【读 AI】修复 AI 写的折扣函数 ============
def discount(price, rate=0.8):
    return price * rate

# ============ 【读 AI】修复 AI 的格式化函数 ============
def format_price(price):
    if price >= 1000:
        price = price / 1000
        return f"{price:.1f} 千元"
    return f"{price:.1f} 元"

# ============ 【手搓】自己实现面积函数 ============
import math

def area(radius, digits=2):
    result = math.pi * radius ** 2
    return round(result, digits)`,
    testCode: `# === 测试（请勿修改） ===
for fn in ("discount", "format_price", "area"):
    if fn not in dir():
        raise AssertionError(f"请先定义函数 {fn}")
assert abs(discount(100) - 80) < 0.001, "discount(100) 应为 80（默认 8 折）"
assert abs(discount(100, 0.5) - 50) < 0.001, "discount(100, 0.5) 应为 50"
assert discount(0) == 0, "discount(0) 应为 0"
assert format_price(1200) == "1.2 千元", "format_price(1200) 应为 1.2 千元"
assert format_price(800) == "800.0 元", "format_price(800) 应为 800.0 元"
assert area(1) == 3.14, "area(1) 应为 3.14（保留 2 位小数）"
assert abs(area(1, 4) - 3.1416) < 0.0001, "area(1, 4) 应为 3.1416（保留 4 位小数）"
assert area(0) == 0, "area(0) 应为 0"
print("🎉 全部通过！")`,
    hints: [
      '参数顺序：def discount(price, rate=0.8)，把价格放前面',
      '缩进修复：>= 1000 时的 return 要缩进到 if 内部（4 个空格）',
      '手搓面积：import math 后用 math.pi * radius ** 2，再 round(结果, digits)',
    ],
  },
  {
    order: 11,
    chapter: '第三章：AI 协作：读懂与验证',
    title: '异常与调试：AI 会崩，你得会修',
    story:
      'AI 生成的解析代码遇到脏数据（缺键、非法数字）就整段崩溃。小澜先给 AI 代码加"保险"，再自己从头写一个健壮函数——她意识到自己写的代码同样需要这种防御。',
    points: 75,
    badgeId: null,
    contentMd: `## 本关目标
学会用 try/except 给代码加"保险"，认识 ValueError、KeyError，并学会读懂报错信息。

## 报错三看
Python 报错（traceback）一大段，只看三处：
1. 最后一行：错误类型 + 消息（如 ValueError: invalid literal for int()）
2. 箭头指向的行：哪一行出错了
3. 错误类型：ValueError 值不对 / KeyError 键不存在 / TypeError 类型混了

## try/except：尝试，失败了兜底

\`\`\`python
try:
    n = int("abc")     # 这行会报错
except ValueError:
    n = 0              # 出错就走到这里，不崩溃
\`\`\`

## 字典安全取值：get

\`\`\`python
data = {"name": "小澜"}
print(data["age"])      # KeyError 崩溃！
print(data.get("age"))  # None，安全
\`\`\`

> 🤖 AI 视角：AI 生成的代码在"干净数据"上跑得很好，一到真实脏数据（缺键、非法格式）就整段崩溃。学会"报错三看"，你就能快速定位 AI 代码崩在哪一行、为什么崩。

> ✍️ 手搓时刻：防御式编程是手搓代码的必备习惯——不确定的数据，先想"如果这里出错了怎么办"。

> 💡 记忆口诀：**try 尝试、except 兜底、get 安全取值、报错先看最后一行**。`,
    starterCode: `# ============ 【读 AI】修复 AI 的解析函数 ============
# AI 写的 safe_parse：遇到 "abc" 这种没法转数字的文本就整段崩溃
# 需求：转换成功返回整数；转换失败返回 None（不要崩溃）
# 请用 try/except 加上防御（int() 失败会抛 ValueError）

def safe_parse(text):
    return int(text)

# ============ 【读 AI】修复 AI 的取值函数 ============
# AI 写的 safe_get：字典缺键时直接报 KeyError
# 需求：键存在返回对应值；键不存在返回 None（不要崩溃）
# 提示：字典自带的安全取值方法 .get() 可以一步到位

def safe_get(data, key):
    return data[key]

# ============ 【手搓】自己写一个健壮的均值函数 ============
# 需求：函数 safe_average(nums)
#   - 空列表返回 0
#   - 有数据返回平均值（可以用 sum(nums) / len(nums)）
#   - 任何情况下都不抛异常
# 例：safe_average([1, 2, 3]) 返回 2.0；safe_average([]) 返回 0
# 注意：函数体完全自己写

def safe_average(nums):
    pass`,
    answerCode: `# ============ 【读 AI】修复 AI 的解析函数 ============
def safe_parse(text):
    try:
        return int(text)
    except ValueError:
        return None

# ============ 【读 AI】修复 AI 的取值函数 ============
def safe_get(data, key):
    return data.get(key)

# ============ 【手搓】自己写一个健壮的均值函数 ============
def safe_average(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)`,
    testCode: `# === 测试（请勿修改） ===
for fn in ("safe_parse", "safe_get", "safe_average"):
    if fn not in dir():
        raise AssertionError(f"请先定义函数 {fn}")

# safe_parse：转换成功/失败都不崩
assert safe_parse("88") == 88, "safe_parse('88') 应为 88"
try:
    r1 = safe_parse("abc")
except Exception:
    raise AssertionError("safe_parse('abc') 抛出了异常：转换失败时应返回兜底值（0 或 None），不能崩溃")
assert r1 in (0, None), "safe_parse('abc') 应返回兜底值（0 或 None）"
try:
    r2 = safe_parse("12.5")
except Exception:
    raise AssertionError("safe_parse('12.5') 抛出了异常：转换失败时应返回兜底值（0 或 None），不能崩溃")
assert r2 in (0, None), "safe_parse('12.5') 应返回兜底值（0 或 None）"

# safe_get：缺键不崩
assert safe_get({"name": "小澜"}, "name") == "小澜", "键存在时应返回对应值"
assert safe_get({"name": "小澜"}, "age") is None, "缺键时应返回 None，不能抛 KeyError"

# safe_average：任何情况不崩
assert safe_average([]) == 0, "空列表应返回 0"
assert abs(safe_average([1, 2, 3]) - 2.0) < 0.0001, "safe_average([1, 2, 3]) 应为 2.0"
assert abs(safe_average([10]) - 10.0) < 0.0001, "safe_average([10]) 应为 10.0"
print("🎉 全部通过！")`,
    hints: [
      '防御解析：try: return int(text) except ValueError: return None',
      '安全取值：data.get(key) 一步到位，缺键自动返回 None',
      '手搓均值：if not nums: return 0，再 sum(nums) / len(nums)',
    ],
  },
  {
    order: 12,
    chapter: '第三章：AI 协作：读懂与验证',
    title: '综合实战：手搓验证 AI 的报告',
    story:
      '老板要季度销售报告，AI 一口气写完但把退款订单也计入销售额（结论错了）。小澜关掉 AI，自己从头写分析脚本算出正确答案，反过来纠正 AI——第三章毕业考。',
    points: 90,
    badgeId: 'badge-level-12',
    contentMd: `## 本关目标
综合运用前面学的全部招式（json 解析、列表推导、字典统计、函数），独立验证 AI 给出的分析结论。

## 综合招式回顾
- json.loads：接口字符串 → 字典/列表
- 遍历 + 条件：筛选出 paid 订单
- 字典累加：统计状态分布
- sum(生成器)：一行求和

## 验收的本质
AI 给你一个结论（比如"总销售额 2803 元"），你要能自己算出正确答案，判断 AI 对不对。这需要你具备独立从数据到结论的完整能力——这正是"手搓"的价值。

> 🤖 AI 视角 + ✍️ 手搓时刻：这一关没有 AI 的代码给你修——只有 AI 的结论等你验证。当你算出 1696 而 AI 说 2803 时，你能指出"它把退款订单也算进去了"，这才是 AI 时代真正的上限：**AI 是杠杆，而手搓是你的支点**。

> 💡 记忆口诀：**解析 → 筛选 → 统计 → 验证**。`,
    starterCode: `import json

# 季度订单数据（已给出）
orders_json = """
[
  {"id": "D001", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D002", "product": "智能手表", "amount": 899, "status": "paid"},
  {"id": "D003", "product": "无线充电板", "amount": 129, "status": "pending"},
  {"id": "D004", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D005", "product": "智能手表", "amount": 899, "status": "refund"},
  {"id": "D006", "product": "机械键盘", "amount": 199, "status": "paid"},
  {"id": "D007", "product": "游戏鼠标", "amount": 79, "status": "refund"}
]
"""

orders = json.loads(orders_json)

# ============ 【手搓】验证 AI 的销售额结论 ============
# AI 的结论："本季度总销售额 2803 元"——但它把退款订单也算进去了！
# 需求：函数 total_paid(orders) 只统计 status == "paid" 的订单金额总和
# 例：只算 4 笔已支付订单，正确值应为 1696
# 注意：函数体完全自己写

def total_paid(orders):
    pass

# ============ 【手搓】统计订单状态分布 ============
# 需求：函数 status_count(orders) 返回每种状态的数量
# 例：{"paid": 4, "pending": 1, "refund": 2}
# 提示：用字典累加 result[s] = result.get(s, 0) + 1
# 注意：函数体完全自己写

def status_count(orders):
    pass

# ============ 【手搓】写一个验收函数 ============
# 需求：函数 validate_report(total)
#   - total 等于正确销售额 1696 时返回 True
#   - 其他值（比如 AI 算的 2803）返回 False
# 注意：函数体完全自己写

def validate_report(total):
    pass`,
    answerCode: `import json

# 季度订单数据（已给出）
orders_json = """
[
  {"id": "D001", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D002", "product": "智能手表", "amount": 899, "status": "paid"},
  {"id": "D003", "product": "无线充电板", "amount": 129, "status": "pending"},
  {"id": "D004", "product": "蓝牙耳机", "amount": 299, "status": "paid"},
  {"id": "D005", "product": "智能手表", "amount": 899, "status": "refund"},
  {"id": "D006", "product": "机械键盘", "amount": 199, "status": "paid"},
  {"id": "D007", "product": "游戏鼠标", "amount": 79, "status": "refund"}
]
"""

orders = json.loads(orders_json)

# ============ 【手搓】验证 AI 的销售额结论 ============
def total_paid(orders):
    return sum(o["amount"] for o in orders if o["status"] == "paid")

# ============ 【手搓】统计订单状态分布 ============
def status_count(orders):
    result = {}
    for o in orders:
        s = o["status"]
        result[s] = result.get(s, 0) + 1
    return result

# ============ 【手搓】写一个验收函数 ============
def validate_report(total):
    return total == 1696`,
    testCode: `# === 测试（请勿修改） ===
for fn in ("total_paid", "status_count", "validate_report"):
    if fn not in dir():
        raise AssertionError(f"请先定义函数 {fn}")

# 手搓 1：销售额只算已支付
assert total_paid(orders) == 1696, "正确销售额应为 1696（只算 paid：299+899+299+199）——AI 算的 2803 把退款也加进去了"

# 手搓 2：状态分布
assert status_count(orders) == {"paid": 4, "pending": 1, "refund": 2}, "状态分布应为 {'paid': 4, 'pending': 1, 'refund': 2}"

# 手搓 3：验收函数
assert validate_report(1696) is True, "validate_report(1696) 应为 True（1696 是正确值）"
assert validate_report(2803) is False, "validate_report(2803) 应为 False（2803 是 AI 的错误结论）"
print("🎉 全部通过！你已能独立验证 AI 的分析报告！")`,
    hints: [
      '总销售额：sum(o["amount"] for o in orders if o["status"] == "paid")',
      '状态分布：字典累加 result[s] = result.get(s, 0) + 1',
      '验收函数：return total == 1696',
    ],
  },
];
