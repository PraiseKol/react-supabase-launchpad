// hooks/useGameUser.js 
import { useEffect, useState, useCallback, useRef } from 'react'; 
import { supabase } from '@/lib/supabaseClient'; 
import { calculateUpdatedLives } from '@/utils/lifeUtils'; 
export function useGameUser(userId) { 
  const [gameUser, setGameUser] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const intervalRef = useRef(null); 
  
  const fetchGameUser = useCallback(async () => { 
    if (!userId) { 
      setLoading(false); 
      return; 
    } 
    
    try { 
      const { data, error } = await supabase
        .from('game_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("❌ Error fetching game user:", error);
        setLoading(false);
        return;
      }

      let userData = data;

      if (!userData) {
        console.log("🆕 Creating new game_user record...");
        const { data: newUser, error: insertError } = await supabase
          .from('game_users')
          .insert({
            user_id: userId,
            lives: 5,
            last_life_lost_at: null,
            player_name: null,
            talents: 20,
            powerups_inventory: {},
          })
          .select()
          .maybeSingle();

        if (insertError || !newUser) {
          // A parallel insert may have won the race; re-read once.
          const { data: retry } = await supabase
            .from('game_users')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          if (!retry) {
            console.error("❌ Failed to create game user:", insertError);
            setLoading(false);
            return;
          }
          userData = retry;
        } else {
          userData = newUser;
        }
      }
      
      // 🧠 Recalculate lives using time logic 
      const { lives, last_life_lost_at } = userData; 
      const { lives: newLives, newLastLostAt } = 
      calculateUpdatedLives(lives, last_life_lost_at); 
      
      // 🛠️ Update lives only if changed 
      if (newLives !== lives) { 
        const updates = { 
          lives: newLives, 
          last_life_lost_at: newLastLostAt, 
          updated_at: new Date().toISOString(), 
        }; 
        
        const { error: updateError } = await supabase 
        .from('game_users') 
        .update(updates) 
        .eq('user_id', userId); 
        
        if (!updateError) { 
          userData.lives = newLives; 
          userData.last_life_lost_at = newLastLostAt; 
        } 
      } 
      setGameUser(userData); 
    } catch (err) { 
      console.error("‼️ Unexpected error in useGameUser:", err); 
    } finally { 
      setLoading(false); 
    } 
  }, [userId]); 
  
  // 🔃 Initial fetch 
  useEffect(() => { 
    fetchGameUser(); 
  }, [fetchGameUser]); 
  
  // ⏱️ Poll every 60 seconds to auto-refresh lives 
  useEffect(() => { 
    if (!userId) return; 
    
    intervalRef.current = setInterval(() => { 
      fetchGameUser(); 
    }, 60000); // every 60s 
    
    return () => { 
      clearInterval(intervalRef.current); 
    }; 
  }, [userId, fetchGameUser]); 
  
  // 🛠 Update game user helper (for talents, inventory, etc.) 
  const updateGameUser = async (updates) => { 
    if (!userId) return; 
    const { error } = await supabase 
    .from('game_users') 
    .update(updates) 
    .eq('user_id', userId); 
    
    if (error) { 
      console.error("❌ Failed to update game user:", error); 
    } else { 
      await fetchGameUser(); 
    } 
  }; 
  
  return { 
    gameUser, 
    loading, 
    refetch: fetchGameUser, 
    updateGameUser, // 👈 can update talents, inventory, etc. 
  };
}
