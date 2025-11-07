import { motion } from 'framer-motion';
import { Snowflake, Flame, Layers, CloudRain, User, Bike, Car, Bus } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'very-active';
type CommuteMethod = 'walk' | 'bike' | 'drive' | 'public-transit';

const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly sitting' },
  { value: 'moderate', label: 'Moderate', description: 'Some movement' },
  { value: 'active', label: 'Active', description: 'Regular exercise' },
  { value: 'very-active', label: 'Very Active', description: 'Athlete level' },
];

// icon typed as any to avoid strict component type coupling
const commuteMethods: { value: CommuteMethod; label: string; icon: any }[] = [
  { value: 'walk', label: 'Walk', icon: User },
  { value: 'bike', label: 'Bike', icon: Bike },
  { value: 'drive', label: 'Drive', icon: Car },
  { value: 'public-transit', label: 'Transit', icon: Bus },
];

interface Step4WeatherLifestyleProps {
  weatherPreferences: {
    coldSensitivity: number;
    heatSensitivity: number;
    layeringPreference: boolean;
    rainPreparation: boolean;
  };
  lifestyle: {
    activity: ActivityLevel;
    commute: CommuteMethod;
    outdoorTime: number;
    fashionRiskTolerance: number;
  };
  onWeatherChange: (field: string, value: number | boolean) => void;
  onLifestyleChange: (field: string, value: string | number) => void;
}

/**
 * Phase 13: Step 4 - Weather & Lifestyle
 * Temperature sensitivity, layering, activity level, commute
 */
export function Step4WeatherLifestyle({
  weatherPreferences,
  lifestyle,
  onWeatherChange,
  onLifestyleChange,
}: Step4WeatherLifestyleProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Tell us about your daily life
        </h2>
        <p className="text-lg text-white/70">
          Help us match outfits to your lifestyle and weather preferences
        </p>
      </div>

      {/* Weather Sensitivity */}
      <QuestionCard delay={0}>
        <h3 className="text-2xl font-bold text-white mb-6">Temperature Preferences</h3>

        <div className="space-y-6">
          {/* Cold Sensitivity */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Cold Sensitivity</span>
                  <span className="text-white/70">{weatherPreferences.coldSensitivity}/10</span>
                </div>
                <p className="text-sm text-white/50">How quickly do you get cold?</p>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={weatherPreferences.coldSensitivity}
              onChange={(e) => onWeatherChange('coldSensitivity', parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Heat Sensitivity */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Heat Sensitivity</span>
                  <span className="text-white/70">{weatherPreferences.heatSensitivity}/10</span>
                </div>
                <p className="text-sm text-white/50">How quickly do you get hot?</p>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={weatherPreferences.heatSensitivity}
              onChange={(e) => onWeatherChange('heatSensitivity', parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Toggle Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <motion.button
            onClick={() => onWeatherChange('layeringPreference', !weatherPreferences.layeringPreference)}
            className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
              weatherPreferences.layeringPreference
                ? 'bg-uw-purple border-2 border-uw-gold'
                : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Layers className="w-6 h-6 text-white" />
            <div className="text-left">
              <div className="text-white font-medium">I love layering</div>
              <div className="text-xs text-white/60">Suggest layered outfits</div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => onWeatherChange('rainPreparation', !weatherPreferences.rainPreparation)}
            className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
              weatherPreferences.rainPreparation
                ? 'bg-uw-purple border-2 border-uw-gold'
                : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CloudRain className="w-6 h-6 text-white" />
            <div className="text-left">
              <div className="text-white font-medium">Always rain-ready</div>
              <div className="text-xs text-white/60">Prepare for rain</div>
            </div>
          </motion.button>
        </div>
      </QuestionCard>

      {/* Activity Level */}
      <QuestionCard delay={0.1}>
        <h3 className="text-2xl font-bold text-white mb-4">Activity Level</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {activityLevels.map((level) => {
            const isSelected = lifestyle.activity === level.value;
            return (
              <motion.button
                key={level.value}
                onClick={() => onLifestyleChange('activity', level.value)}
                className={`p-4 rounded-xl text-center transition-all duration-300 ${
                  isSelected
                    ? 'bg-uw-purple border-2 border-uw-gold text-white'
                    : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-bold text-base mb-1">{level.label}</div>
                <div className="text-xs opacity-80">{level.description}</div>
              </motion.button>
            );
          })}
        </div>
      </QuestionCard>

      {/* Commute Method */}
      <QuestionCard delay={0.2}>
        <h3 className="text-2xl font-bold text-white mb-4">How do you get around?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commuteMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = lifestyle.commute === method.value;
            return (
              <motion.button
                key={method.value}
                onClick={() => onLifestyleChange('commute', method.value)}
                className={`p-6 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 ${
                  isSelected
                    ? 'bg-uw-purple border-2 border-uw-gold text-white'
                    : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-8 h-8" />
                <div className="font-bold">{method.label}</div>
              </motion.button>
            );
          })}
        </div>
      </QuestionCard>

      {/* Fashion Risk Tolerance */}
      <QuestionCard delay={0.3}>
        <h3 className="text-2xl font-bold text-white mb-4">Fashion Risk Tolerance</h3>
        <p className="text-white/70 mb-4">How adventurous are you with your style?</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Play it safe</span>
            <span className="font-bold text-lg text-white">{lifestyle.fashionRiskTolerance}/10</span>
            <span>Experimental</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={lifestyle.fashionRiskTolerance}
            onChange={(e) => onLifestyleChange('fashionRiskTolerance', parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-uw-gold [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="text-center text-sm text-white/60 mt-2">
            {lifestyle.fashionRiskTolerance <= 3
              ? 'You prefer classic, safe choices'
              : lifestyle.fashionRiskTolerance <= 6
              ? 'You like some variety but not too bold'
              : 'You love trying new, experimental looks!'}
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}
