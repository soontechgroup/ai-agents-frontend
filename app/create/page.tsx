'use client';

import { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DigitalHumanData {
  name: string;
  shortDescription: string;
  detailedDescription: string;
  type: string;
  skills: string[];
  personality: {
    professionalism: number;
    friendliness: number;
    humor: number;
  };
  conversationStyle: string;
  avatar?: File;
}

export default function CreateDigitalHumanPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DigitalHumanData>({
    name: '',
    shortDescription: '',
    detailedDescription: '',
    type: '专业助手',
    skills: [],
    personality: {
      professionalism: 80,
      friendliness: 90,
      humor: 60
    },
    conversationStyle: '专业严谨'
  });

  const [newSkill, setNewSkill] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const digitalHumanTypes = [
    { id: '专业助手', name: '专业助手', icon: '💼', desc: '专业领域的知识问答和指导' },
    { id: '教育导师', name: '教育导师', icon: '🎓', desc: '学习辅导和知识传授' },
    { id: '陪伴聊天', name: '陪伴聊天', icon: '💬', desc: '日常对话和情感陪伴' },
    { id: '任务助理', name: '任务助理', icon: '🎯', desc: '任务管理和工作协助' },
    { id: '创意伙伴', name: '创意伙伴', icon: '🎨', desc: '创意激发和艺术创作' },
    { id: '自定义', name: '自定义', icon: '🔧', desc: '自由定制数字人能力' }
  ];

  const conversationStyles = [
    '专业严谨',
    '轻松活泼',
    '温柔耐心',
    '简洁高效',
    '富有创意'
  ];

  const handleClose = () => {
    router.back();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreate();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // TODO: 调用 API 创建数字人
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟 API 调用
      
      // 创建成功后跳转到首页
      router.push('/');
    } catch (error) {
      console.error('创建数字人失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const steps = [
    { id: 1, label: '基本信息' },
    { id: 2, label: '类型选择' },
    { id: 3, label: '能力配置' },
    { id: 4, label: '预览确认' }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Grid background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Modal overlay */}
      <div 
        className="fixed inset-0 backdrop-blur-[10px] flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(10, 22, 40, 0.85)' }}
      >
        {/* Modal container */}
        <div 
          className="w-[90%] max-w-[800px] max-h-[90vh] rounded-[20px] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-4 duration-300"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          {/* Gradient border effect */}
          <div 
            className="absolute inset-[-2px] rounded-[20px] p-[2px] opacity-50 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude'
            }}
          />

          {/* Header */}
          <div 
            className="p-8 border-b flex items-center justify-between"
            style={{
              borderColor: 'var(--border-default)',
              backgroundColor: 'rgba(26, 26, 46, 0.5)'
            }}
          >
            <h2 
              className="text-2xl font-semibold bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] bg-clip-text text-transparent"
            >
              创建数字人
            </h2>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-lg border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--error)] hover:border-[var(--error)] hover:bg-[rgba(255,82,82,0.1)] transition-all duration-150"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Progress indicator */}
            <div className="flex justify-center gap-4 mb-12">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-2 relative">
                  {index < steps.length - 1 && (
                    <div 
                      className="absolute top-5 left-[calc(50%+30px)] w-[calc(100%-60px)] h-0.5"
                      style={{
                        backgroundColor: currentStep > step.id ? 'var(--accent-primary)' : 'var(--border-default)'
                      }}
                    />
                  )}
                  
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      currentStep === step.id 
                        ? 'text-[var(--bg-primary)]' 
                        : currentStep > step.id
                        ? 'text-[var(--bg-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                    style={{
                      background: currentStep === step.id 
                        ? 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)'
                        : currentStep > step.id
                        ? 'var(--success)'
                        : 'var(--bg-secondary)',
                      border: currentStep === step.id || currentStep > step.id
                        ? 'none'
                        : '2px solid var(--border-default)',
                      boxShadow: currentStep === step.id ? 'var(--glow-sm)' : 'none'
                    }}
                  >
                    {step.id}
                  </div>
                  <span 
                    className={`text-xs ${
                      currentStep === step.id ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="animate-in fade-in duration-300">
              {currentStep === 1 && (
                <div>
                  {/* Avatar upload */}
                  <div className="text-center mb-8">
                    <div 
                      className="w-30 h-30 mx-auto mb-4 rounded-[20px] border-3 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                        borderColor: 'var(--border-default)',
                        width: '120px',
                        height: '120px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = 'var(--glow-sm)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <span className="text-5xl text-[var(--text-muted)]">+</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">点击上传数字人头像</p>
                  </div>

                  {/* Basic info form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        数字人名称
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="给你的数字人起个名字"
                        className="w-full p-3.5 rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-[rgba(0,217,255,0.1)]"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--accent-primary)';
                          e.target.style.boxShadow = 'var(--glow-sm)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--border-default)';
                          e.target.style.boxShadow = '';
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        简短描述
                        <button className="ml-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs transition-all duration-300 hover:translate-y-[-1px]"
                          style={{
                            backgroundColor: 'rgba(123, 104, 238, 0.1)',
                            border: '1px solid var(--accent-secondary)',
                            color: 'var(--accent-secondary)'
                          }}
                        >
                          <Sparkles size={14} />
                          AI生成
                        </button>
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        placeholder="用一句话介绍你的数字人"
                        className="w-full p-3.5 rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--accent-primary)';
                          e.target.style.boxShadow = 'var(--glow-sm)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--border-default)';
                          e.target.style.boxShadow = '';
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        详细介绍
                      </label>
                      <textarea
                        value={formData.detailedDescription}
                        onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                        placeholder="详细描述数字人的功能、特点和使用场景..."
                        rows={4}
                        className="w-full p-3.5 rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300 focus:outline-none resize-none"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--accent-primary)';
                          e.target.style.boxShadow = 'var(--glow-sm)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--border-default)';
                          e.target.style.boxShadow = '';
                        }}
                      />
                      <div className="text-right text-xs text-[var(--text-muted)] mt-1">
                        {formData.detailedDescription.length} / 500
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {digitalHumanTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`p-6 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                        formData.type === type.id
                          ? 'border-[var(--accent-primary)]'
                          : 'border-[var(--border-default)]'
                      }`}
                      style={{
                        backgroundColor: formData.type === type.id 
                          ? 'rgba(0, 217, 255, 0.1)' 
                          : 'var(--bg-secondary)',
                        border: `2px solid ${formData.type === type.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        boxShadow: formData.type === type.id ? 'var(--glow-sm)' : ''
                      }}
                      onMouseEnter={(e) => {
                        if (formData.type !== type.id) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = 'var(--border-hover)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.type !== type.id) {
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.borderColor = 'var(--border-default)';
                          e.currentTarget.style.boxShadow = '';
                        }
                      }}
                    >
                      <div className="text-4xl mb-3">{type.icon}</div>
                      <div className="font-semibold mb-2 text-[var(--text-primary)]">{type.name}</div>
                      <div className="text-sm text-[var(--text-secondary)] leading-relaxed">{type.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  {/* Skills section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                      <span>🎯</span>
                      专业领域
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="输入专业领域标签"
                        className="flex-1 p-3.5 rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-6 py-3.5 rounded-lg font-medium text-[var(--bg-primary)] transition-all duration-300 hover:translate-y-[-2px]"
                        style={{
                          background: 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)',
                          boxShadow: 'var(--shadow-md)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--glow-sm)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                      >
                        添加
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm animate-in fade-in duration-300"
                          style={{
                            backgroundColor: 'rgba(0, 217, 255, 0.1)',
                            border: '1px solid var(--accent-primary)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-[var(--accent-primary)] hover:text-[var(--error)] transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personality section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                      <span>😊</span>
                      性格特征
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(formData.personality).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-[var(--text-secondary)]">
                              {key === 'professionalism' ? '专业性' : 
                               key === 'friendliness' ? '友善度' : '幽默感'}
                            </span>
                            <span className="font-semibold text-[var(--accent-primary)]">{value}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => setFormData({
                              ...formData,
                              personality: {
                                ...formData.personality,
                                [key]: parseInt(e.target.value)
                              }
                            })}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{
                              backgroundColor: 'var(--bg-secondary)',
                              background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${value}%, var(--bg-secondary) ${value}%, var(--bg-secondary) 100%)`
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversation style */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                      <span>💬</span>
                      对话风格
                    </h3>
                    <select
                      value={formData.conversationStyle}
                      onChange={(e) => setFormData({ ...formData, conversationStyle: e.target.value })}
                      className="w-full p-3.5 rounded-lg text-[var(--text-primary)] transition-all duration-300 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)'
                      }}
                    >
                      {conversationStyles.map((style) => (
                        <option key={style} value={style} className="bg-[var(--bg-secondary)]">
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <div 
                    className="rounded-2xl p-8 mb-8"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)'
                    }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-[var(--bg-primary)]"
                        style={{
                          background: 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)'
                        }}
                      >
                        {digitalHumanTypes.find(t => t.id === formData.type)?.icon || '🎯'}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                          {formData.name || '未设置名称'}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {formData.shortDescription || '未设置描述'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: '类型', value: formData.type },
                        { label: '专业领域', value: formData.skills.join('、') || '未设置' },
                        { label: '对话风格', value: formData.conversationStyle },
                        { 
                          label: '性格特征', 
                          value: `专业性${formData.personality.professionalism}% · 友善度${formData.personality.friendliness}% · 幽默感${formData.personality.humor}%` 
                        }
                      ].map((item) => (
                        <div 
                          key={item.label}
                          className="flex justify-between py-3 border-b border-[var(--border-default)] last:border-b-0"
                        >
                          <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                          <span className="font-medium text-[var(--text-primary)]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      ✨ 您的数字人即将创建完成！创建后可以随时调整设置。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div 
            className="p-6 border-t flex justify-between items-center"
            style={{
              borderColor: 'var(--border-default)',
              backgroundColor: 'rgba(26, 26, 46, 0.5)'
            }}
          >
            <button className="px-8 py-3 rounded-lg font-medium transition-all duration-300 text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--accent-primary)] hover:bg-[rgba(0,217,255,0.05)]">
              保存草稿
            </button>
            
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-8 py-3 rounded-lg font-medium transition-all duration-300 text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--accent-primary)] hover:bg-[rgba(0,217,255,0.05)]"
                >
                  上一步
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isCreating}
                className="px-8 py-3 rounded-lg font-medium text-[var(--bg-primary)] transition-all duration-300 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  if (!isCreating) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--glow-md)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCreating) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
              >
                {isCreating ? '创建中...' : currentStep === 4 ? '创建数字人' : '下一步'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}