# AI 评估训练模块摘录

本目录是从当前项目中按“复制”方式摘录出的独立模块，不影响原项目现有流程与实现逻辑。

## 模块范围

本次按“AI 评估训练环节”理解，摘录了以下页面与其直接依赖：

- `TrainingFlowPage.tsx`
- `EvaluationPage.tsx`
- 这两个页面依赖的 `mock`、`storage`、`Stepper`

本次未包含：

- `HumanEvaluationPage.tsx`
- 团队列表、员工详情、招聘创建等其他页面

## 摘录目录

模块根目录：

- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training`

主要文件：

- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training\src\features\team\pages\TrainingFlowPage.tsx`
- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training\src\features\team\pages\EvaluationPage.tsx`
- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training\src\features\team\mock\data.ts`
- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training\src\features\team\utils\storage.ts`
- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training\src\shared\mock\data.ts`
- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training\src\shared\utils\storage.ts`
- `D:\zhiyong\公司项目\ncrew\ncrew_hire_web\module_exports\ai-evaluation-training\src\shared\components\Stepper.tsx`

## 原始来源

- `src/features/team/pages/TrainingFlowPage.tsx`
- `src/features/team/pages/EvaluationPage.tsx`
- `src/features/team/mock/data.ts`
- `src/features/team/utils/storage.ts`
- `src/shared/mock/data.ts`
- `src/shared/utils/storage.ts`
- `src/shared/components/Stepper.tsx`

## 嫁接说明

当前复制结果保留了原项目的 `src/...` 目录结构，便于你在其他产品中继续沿用原有 import 习惯。

若要直接运行到其他项目，通常还需要目标项目具备这些基础依赖：

- `react`
- `react-router-dom`
- `lucide-react`
- Tailwind CSS 样式体系
- `localStorage` 运行环境
