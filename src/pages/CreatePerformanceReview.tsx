import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  User, 
  Calendar, 
  Star, 
  Save,
  ArrowLeft,
  Award,
  CheckCircle,
  Target,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  FileText
} from "lucide-react";
import { employeesApi } from "@/lib/api/employees";
import { CreatePerformanceReviewInput, PerformanceRating, Employee } from "@/types/employee";
import AppLayout from "@/components/AppLayout";

const CreatePerformanceReview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<CreatePerformanceReviewInput>({
    employee_id: "",
    review_period_start: "",
    review_period_end: "",
    review_date: new Date().toISOString().split('T')[0],
    reviewer_name: "",
    overall_rating: "satisfactory",
    punctuality_rating: "satisfactory",
    quality_rating: "satisfactory",
    teamwork_rating: "satisfactory",
    communication_rating: "satisfactory",
    initiative_rating: "satisfactory",
    jobs_completed: 0,
    client_satisfaction_score: 0,
    attendance_percentage: 0,
    strengths: [],
    areas_for_improvement: [],
    goals: [],
    comments: "",
    employee_comments: "",
    action_items: [],
    next_review_date: ""
  });

  const [strengthInput, setStrengthInput] = useState("");
  const [improvementInput, setImprovementInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [actionItemInput, setActionItemInput] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeesApi.getAll({ status: ['active'] });
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error("Failed to load employees");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const addStrength = () => {
    if (strengthInput.trim() && !formData.strengths.includes(strengthInput.trim())) {
      setFormData(prev => ({
        ...prev,
        strengths: [...prev.strengths, strengthInput.trim()]
      }));
      setStrengthInput("");
    }
  };

  const removeStrength = (strength: string) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter(s => s !== strength)
    }));
  };

  const addImprovement = () => {
    if (improvementInput.trim() && !formData.areas_for_improvement.includes(improvementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        areas_for_improvement: [...prev.areas_for_improvement, improvementInput.trim()]
      }));
      setImprovementInput("");
    }
  };

  const removeImprovement = (improvement: string) => {
    setFormData(prev => ({
      ...prev,
      areas_for_improvement: prev.areas_for_improvement.filter(i => i !== improvement)
    }));
  };

  const addGoal = () => {
    if (goalInput.trim() && !formData.goals.includes(goalInput.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, goalInput.trim()]
      }));
      setGoalInput("");
    }
  };

  const removeGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }));
  };

  const addActionItem = () => {
    if (actionItemInput.trim() && !formData.action_items.includes(actionItemInput.trim())) {
      setFormData(prev => ({
        ...prev,
        action_items: [...prev.action_items, actionItemInput.trim()]
      }));
      setActionItemInput("");
    }
  };

  const removeActionItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.filter(i => i !== item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.review_period_start || !formData.review_period_end || !formData.reviewer_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await employeesApi.createPerformanceReview(formData);
      toast.success("Performance review created successfully!");
      navigate("/performance");
    } catch (error) {
      console.error('Error creating performance review:', error);
      toast.error("Failed to create performance review");
    } finally {
      setLoading(false);
    }
  };

  // Get star rating component
  const StarRating = ({ 
    label, 
    name, 
    value, 
    onChange, 
    icon: Icon,
    description 
  }: { 
    label: string; 
    name: string; 
    value: PerformanceRating; 
    onChange: (rating: PerformanceRating) => void;
    icon: React.ElementType;
    description: string;
  }) => {
    const ratings: { value: PerformanceRating; label: string; stars: number }[] = [
      { value: 'unsatisfactory', label: 'Unsatisfactory', stars: 1 },
      { value: 'needs_improvement', label: 'Needs Improvement', stars: 2 },
      { value: 'satisfactory', label: 'Satisfactory', stars: 3 },
      { value: 'good', label: 'Good', stars: 4 },
      { value: 'excellent', label: 'Excellent', stars: 5 }
    ];

    const currentRating = ratings.find(r => r.value === value) || ratings[2];

    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-pulse-100 rounded-full flex items-center justify-center">
            <Icon className="w-4 h-4 text-pulse-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {ratings.map((rating) => (
            <label key={rating.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={name}
                value={rating.value}
                checked={value === rating.value}
                onChange={() => onChange(rating.value)}
                className="text-pulse-500 focus:ring-pulse-500"
              />
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating.stars
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{rating.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/performance"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                <Award className="w-8 h-8 text-pulse-600" />
                Create Performance Review
              </h1>
              <p className="mt-1 text-gray-600">Evaluate employee performance and provide feedback</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-pulse-600" />
              <h2 className="text-xl font-semibold text-gray-900">Review Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee *
                </label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  name="reviewer_name"
                  value={formData.reviewer_name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Period Start *
                </label>
                <input
                  type="date"
                  name="review_period_start"
                  value={formData.review_period_start}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Period End *
                </label>
                <input
                  type="date"
                  name="review_period_end"
                  value={formData.review_period_end}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Date *
                </label>
                <input
                  type="date"
                  name="review_date"
                  value={formData.review_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Review Date
                </label>
                <input
                  type="date"
                  name="next_review_date"
                  value={formData.next_review_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Performance Ratings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-pulse-600" />
              <h2 className="text-xl font-semibold text-gray-900">Performance Ratings</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StarRating
                label="Overall Performance"
                name="overall_rating"
                value={formData.overall_rating}
                onChange={(rating) => setFormData(prev => ({ ...prev, overall_rating: rating }))}
                icon={Award}
                description="General work performance and contribution"
              />

              <StarRating
                label="Punctuality"
                name="punctuality_rating"
                value={formData.punctuality_rating}
                onChange={(rating) => setFormData(prev => ({ ...prev, punctuality_rating: rating }))}
                icon={Clock}
                description="Timeliness and reliability"
              />

              <StarRating
                label="Quality of Work"
                name="quality_rating"
                value={formData.quality_rating}
                onChange={(rating) => setFormData(prev => ({ ...prev, quality_rating: rating }))}
                icon={CheckCircle}
                description="Standards and attention to detail"
              />

              <StarRating
                label="Teamwork"
                name="teamwork_rating"
                value={formData.teamwork_rating}
                onChange={(rating) => setFormData(prev => ({ ...prev, teamwork_rating: rating }))}
                icon={Users}
                description="Collaboration and team spirit"
              />

              <StarRating
                label="Communication"
                name="communication_rating"
                value={formData.communication_rating}
                onChange={(rating) => setFormData(prev => ({ ...prev, communication_rating: rating }))}
                icon={MessageSquare}
                description="Verbal and written communication skills"
              />

              <StarRating
                label="Initiative"
                name="initiative_rating"
                value={formData.initiative_rating}
                onChange={(rating) => setFormData(prev => ({ ...prev, initiative_rating: rating }))}
                icon={TrendingUp}
                description="Proactiveness and self-motivation"
              />
            </div>
          </div>

          {/* Quantitative Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-pulse-600" />
              <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jobs Completed
                </label>
                <input
                  type="number"
                  name="jobs_completed"
                  value={formData.jobs_completed}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Satisfaction Score (1-5)
                </label>
                <input
                  type="number"
                  name="client_satisfaction_score"
                  value={formData.client_satisfaction_score}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Percentage
                </label>
                <input
                  type="number"
                  name="attendance_percentage"
                  value={formData.attendance_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Feedback Sections */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-pulse-600" />
              <h2 className="text-xl font-semibold text-gray-900">Detailed Feedback</h2>
            </div>
            
            <div className="space-y-6">
              {/* Strengths */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strengths
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={strengthInput}
                    onChange={(e) => setStrengthInput(e.target.value)}
                    placeholder="Enter a strength"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                  />
                  <button
                    type="button"
                    onClick={addStrength}
                    className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.strengths.map((strength, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {strength}
                      <button
                        type="button"
                        onClick={() => removeStrength(strength)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={improvementInput}
                    onChange={(e) => setImprovementInput(e.target.value)}
                    placeholder="Enter an area for improvement"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
                  />
                  <button
                    type="button"
                    onClick={addImprovement}
                    className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.areas_for_improvement.map((improvement, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {improvement}
                      <button
                        type="button"
                        onClick={() => removeImprovement(improvement)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals for Next Period
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Enter a goal"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.goals.map((goal, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {goal}
                      <button
                        type="button"
                        onClick={() => removeGoal(goal)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Items
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={actionItemInput}
                    onChange={(e) => setActionItemInput(e.target.value)}
                    placeholder="Enter an action item"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActionItem())}
                  />
                  <button
                    type="button"
                    onClick={addActionItem}
                    className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.action_items.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeActionItem(item)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Comments
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed feedback and observations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>

              {/* Employee Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Comments (Optional)
                </label>
                <textarea
                  name="employee_comments"
                  value={formData.employee_comments}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Employee's self-assessment or responses..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Link
              to="/performance"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Creating Review...' : 'Create Review'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default CreatePerformanceReview; 