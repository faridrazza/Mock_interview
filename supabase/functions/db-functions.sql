
-- Function to check if pg_cron extension is installed
CREATE OR REPLACE FUNCTION public.get_installed_extensions()
RETURNS TABLE(name text, default_version text, installed_version text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' 
AS $$
BEGIN
  RETURN QUERY SELECT e.name, e.default_version, e.installed_version
  FROM pg_available_extensions e
  WHERE e.installed_version IS NOT NULL;
END;
$$;

-- Function to check if a specific cron job exists
CREATE OR REPLACE FUNCTION public.check_if_cron_job_exists(job_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' 
AS $$
DECLARE
  job_exists boolean;
  job_count int;
BEGIN
  SELECT COUNT(*) > 0 INTO job_exists
  FROM cron.job
  WHERE jobname = job_name;
  
  RETURN json_build_object('exists', job_exists);
END;
$$;

-- Function to create a new cron job
CREATE OR REPLACE FUNCTION public.create_cron_job(job_name text, job_schedule text, job_command text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  job_id bigint;
BEGIN
  SELECT cron.schedule(job_name, job_schedule, job_command) INTO job_id;
  RETURN json_build_object('job_id', job_id, 'success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to update an existing cron job
CREATE OR REPLACE FUNCTION public.update_cron_job(job_name text, job_schedule text, job_command text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  job_id bigint;
BEGIN
  -- First, unschedule the existing job
  PERFORM cron.unschedule(job_name);
  
  -- Then schedule a new job with the same name but updated schedule/command
  SELECT cron.schedule(job_name, job_schedule, job_command) INTO job_id;
  
  RETURN json_build_object('job_id', job_id, 'success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
